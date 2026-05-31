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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final WalletRepository walletRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository, DriverProfileRepository driverProfileRepository, WalletRepository walletRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.driverProfileRepository = driverProfileRepository;
        this.walletRepository = walletRepository;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        // 1. Tìm thông tin khách hàng đặt đơn
        User customer = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin khách hàng!"));

        // 2. Khởi tạo thực thể Order mới
        Order order = new Order();
        order.setCustomer(customer);
        order.setSenderName(request.getSenderName());
        order.setSenderPhone(request.getSenderPhone());
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setPickupAddress(request.getPickupAddress());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setDistanceKm(request.getDistanceKm());
        order.setPrice(request.getPrice());

        // Mặc định đơn hàng mới tạo sẽ ở trạng thái chờ tài xế (PENDING)
        order.setStatus("PENDING");

        // 3. Sử dụng GeometryUtil để chuyển đổi kinh/vĩ độ thành Point PostGIS
        order.setPickupLocation(GeometryUtil.createPoint(request.getPickupLongitude(), request.getPickupLatitude()));
        order.setDeliveryLocation(GeometryUtil.createPoint(request.getDeliveryLongitude(), request.getDeliveryLatitude()));

        // 4. Lưu đơn hàng xuống Database
        return orderRepository.save(order);
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
}