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

        Order order = new Order();
        order.setCustomer(customer);
        order.setSenderName(request.getSenderName());
        order.setSenderPhone(request.getSenderPhone());
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setPickupAddress(request.getPickupAddress());
        order.setDeliveryAddress(request.getDeliveryAddress());

        Point pickupPoint = GeometryUtil.createPoint(request.getPickupLongitude(), request.getPickupLatitude());
        Point deliveryPoint = GeometryUtil.createPoint(request.getDeliveryLongitude(), request.getDeliveryLatitude());

        order.setPickupLocation(pickupPoint);
        order.setDeliveryLocation(deliveryPoint);

        double distance = calculateDistanceInKm(
                request.getPickupLatitude(), request.getPickupLongitude(),
                request.getDeliveryLatitude(), request.getDeliveryLongitude()
        );

        // Làm tròn khoảng cách về 2 chữ số thập phân (Ví dụ: 1.25 km)
        BigDecimal finalDistance = BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP);
        order.setDistanceKm(finalDistance);

        BigDecimal pricePerKm = new BigDecimal("15000");
        BigDecimal minPrice = new BigDecimal("20000");

        BigDecimal calculatedPrice = finalDistance.multiply(pricePerKm);
        if (calculatedPrice.compareTo(minPrice) < 0) {
            calculatedPrice = minPrice; // Lấy giá mở cửa nếu cuốc xe quá ngắn
        }

        order.setPrice(calculatedPrice.setScale(0, RoundingMode.HALF_UP));

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
        // Bước 2.1: Tìm đơn hàng và kiểm tra trạng thái
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng này đã có tài xế khác nhận hoặc đã bị hủy!");
        }

        // Bước 2.2: Tìm thông tin Tài xế
        User driver = userRepository.findById(request.getDriverId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tài xế!"));

        // Bước 2.3: Xử lý ví tiền của Khách hàng (Trừ tiền)
        var customerWallet = walletRepository.findByUser(order.getCustomer())
                .orElseThrow(() -> new RuntimeException("Khách hàng chưa kích hoạt ví tiền!"));

        if (customerWallet.getBalance().compareTo(order.getPrice()) < 0) {
            throw new RuntimeException("Số dư ví của khách hàng không đủ để thực hiện chuyến đi này!");
        }
        customerWallet.setBalance(customerWallet.getBalance().subtract(order.getPrice()));
        walletRepository.save(customerWallet);

        // Bước 2.4: Xử lý ví tiền của Tài xế (Cộng tiền)
        var driverWallet = walletRepository.findByUser(driver)
                .orElseThrow(() -> new RuntimeException("Tài xế chưa kích hoạt ví tiền!"));

        driverWallet.setBalance(driverWallet.getBalance().add(order.getPrice()));
        walletRepository.save(driverWallet);

        // Bước 2.5: Cập nhật trạng thái đơn hàng và gán tài xế
        order.setDriver(driver);
        order.setStatus("ACCEPTED"); // Chuyển trạng thái sang Đã nhận đơn

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
            throw new RuntimeException("Chỉ có thể hoàn thành những đơn hàng đang ở trạng thái ĐÃ NHẬN (ACCEPTED)!");
        }

        order.setStatus("COMPLETED");

        // Nếu trong Entity Order của bạn có trường ghi nhận thời gian hoàn thành (ví dụ: completedAt)
        // order.setCompletedAt(new java.util.Date());

        return orderRepository.save(order);
    }
}