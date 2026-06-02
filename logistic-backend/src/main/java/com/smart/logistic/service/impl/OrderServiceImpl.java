package com.smart.logistic.service;

import com.smart.logistic.dto.AcceptOrderRequest;
import com.smart.logistic.dto.CreateOrderRequest;
import com.smart.logistic.entity.DriverProfile;
import com.smart.logistic.entity.Order;
import com.smart.logistic.entity.User;
import com.smart.logistic.repository.DriverProfileRepository;
import com.smart.logistic.repository.OrderRepository;
import com.smart.logistic.repository.UserRepository;
import com.smart.logistic.config.GeometryUtil;
import com.smart.logistic.repository.WalletRepository;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final WalletRepository walletRepository;

    public OrderServiceImpl(OrderRepository orderRepository, UserRepository userRepository, DriverProfileRepository driverProfileRepository, WalletRepository walletRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.driverProfileRepository = driverProfileRepository;
        this.walletRepository = walletRepository;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        User customer = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin khách hàng!"));

        // 1. Kiểm tra ví và ĐÓNG BĂNG tiền ngay khi tạo đơn
        var customerWallet = walletRepository.findByUser(customer)
                .orElseThrow(() -> new RuntimeException("Khách hàng chưa kích hoạt ví tiền!"));

        BigDecimal price = calculatePrice(request);

        if (customerWallet.getBalance().compareTo(price) < 0) {
            throw new RuntimeException("Số dư ví của khách hàng không đủ để thực hiện chuyến đi!");
        }

        customerWallet.setBalance(customerWallet.getBalance().subtract(price));
        walletRepository.save(customerWallet);

        // 2. Tạo đơn
        Order order = new Order();
        order.setCustomer(customer);
        order.setSenderName(request.getSenderName());
        order.setSenderPhone(request.getSenderPhone());
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setPickupAddress(request.getPickupAddress());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setPickupLocation(GeometryUtil.createPoint(request.getPickupLongitude(), request.getPickupLatitude()));
        order.setDeliveryLocation(GeometryUtil.createPoint(request.getDeliveryLongitude(), request.getDeliveryLatitude()));
        order.setDistanceKm(BigDecimal.valueOf(calculateDistanceInKm(request.getPickupLatitude(), request.getPickupLongitude(), request.getDeliveryLatitude(), request.getDeliveryLongitude())).setScale(2, RoundingMode.HALF_UP));
        order.setPrice(price);
        order.setStatus("PENDING");

        return orderRepository.save(order);
    }

    /**
     * Hàm bổ trợ tính khoảng cách thực tế giữa 2 tọa độ GPS (Kinh độ/Vĩ độ) theo kilomet
     */
    private double calculateDistanceInKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371 * c; // 6371 là bán kính Trái Đất hệ Kilomet
    }

    private BigDecimal calculatePrice(CreateOrderRequest request) {
        double dist = calculateDistanceInKm(request.getPickupLatitude(), request.getPickupLongitude(), request.getDeliveryLatitude(), request.getDeliveryLongitude());
        BigDecimal distance = BigDecimal.valueOf(dist);
        BigDecimal price = distance.multiply(new BigDecimal("15000"));
        return price.compareTo(new BigDecimal("20000")) < 0 ? new BigDecimal("20000") : price.setScale(0, RoundingMode.HALF_UP);
    }

    public List<DriverProfile> findDriversForOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        // Bán kính quét tài xế 5000 mét
        double radiusMeters = 5000.0;

        // Gọi câu lệnh PostGIS để quét tài xế xung quanh vị trí lấy hàng (pickupLocation)
        return driverProfileRepository.findNearbyAvailableDrivers(order.getPickupLocation(), radiusMeters);
    }

    @Transactional
    public Order acceptOrder(AcceptOrderRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng này đã có tài xế khác nhận hoặc đã bị hủy!");
        }

        User driver = userRepository.findById(request.getDriverId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tài xế!"));

        // Không cần xử lý tiền ở đây vì tiền đã trừ từ lúc createOrder
        order.setDriver(driver);
        order.setStatus("ACCEPTED");
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    @Transactional
    public Order completeOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        if (!"ACCEPTED".equals(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể hoàn thành đơn ở trạng thái ACCEPTED!");
        }

        // GIẢI NGÂN: Cộng tiền đã đóng băng cho tài xế
        var driverWallet = walletRepository.findByUser(order.getDriver())
                .orElseThrow(() -> new RuntimeException("Tài xế chưa có ví!"));

        driverWallet.setBalance(driverWallet.getBalance().add(order.getPrice()));
        walletRepository.save(driverWallet);

        order.setStatus("COMPLETED");
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByDriverAndStatus(UUID driverId, String status) {
        return orderRepository.findByDriverIdAndStatusOrderByUpdatedAtDesc(driverId, status);
    }

    public List<Order> getOrdersByCustomer(UUID customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional
    public Order customerCancelOrder(UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!"PENDING".equals(order.getStatus()) && !"ACCEPTED".equals(order.getStatus())) {
            throw new RuntimeException("Không thể hủy đơn hàng này!");
        }

        // HOÀN TIỀN: Trả lại tiền đóng băng cho khách
        var customerWallet = walletRepository.findByUser(order.getCustomer())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví khách hàng!"));

        customerWallet.setBalance(customerWallet.getBalance().add(order.getPrice()));
        walletRepository.save(customerWallet);

        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }

    @Transactional
    public Order driverCancelOrder(UUID orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!"ACCEPTED".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng không ở trạng thái đang thực hiện!");
        }

        // Tài xế hủy -> Đơn về PENDING để người khác nhận, TIỀN VẪN ĐÓNG BĂNG
        order.setStatus("PENDING");
        order.setDriver(null);
        return orderRepository.save(order);
    }

}