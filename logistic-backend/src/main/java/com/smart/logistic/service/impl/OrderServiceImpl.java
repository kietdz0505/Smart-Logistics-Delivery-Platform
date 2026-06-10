package com.smart.logistic.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.smart.logistic.config.CloudinaryConfig;
import com.smart.logistic.dto.CreateOrderRequest;
import com.smart.logistic.dto.OrderResponse;
import com.smart.logistic.entity.DriverProfile;
import com.smart.logistic.entity.Order;
import com.smart.logistic.entity.OrderStatus;
import com.smart.logistic.entity.User;
import com.smart.logistic.mapper.OrderMapper;
import com.smart.logistic.repository.DriverProfileRepository;
import com.smart.logistic.repository.OrderRepository;
import com.smart.logistic.repository.UserRepository;
import com.smart.logistic.utils.AuthUtil;
import com.smart.logistic.utils.GeometryUtil;
import com.smart.logistic.repository.WalletRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final WalletRepository walletRepository;
    private final AuthUtil authUtil;
    private final OrderMapper orderMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final Cloudinary cloudinary;

    public OrderServiceImpl(OrderRepository orderRepository, UserRepository userRepository, DriverProfileRepository driverProfileRepository, WalletRepository walletRepository, AuthUtil authUtil, OrderMapper orderMapper, SimpMessagingTemplate messagingTemplate, Cloudinary cloudinary) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.driverProfileRepository = driverProfileRepository;
        this.walletRepository = walletRepository;
        this.authUtil = authUtil;
        this.orderMapper = orderMapper;
        this.messagingTemplate = messagingTemplate;
        this.cloudinary = cloudinary;
    }

    private void sendOrderUpdateRealtime(Order order) {
        if (order != null && order.getCustomer() != null) {
            String destination = "/topic/orders/customer/" + order.getCustomer().getId();
            messagingTemplate.convertAndSend(destination, order);
        }
        String orderDetailTopic = "/topic/orders/detail/" + order.getId();
        messagingTemplate.convertAndSend(orderDetailTopic, order);
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        if (request.getDistanceKm() == null || request.getDistanceKm().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Khoảng cách giao hàng không hợp lệ!");
        }
        User customer = userRepository.findByPhone(request.getPhone()).orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin khách hàng!"));

        var customerWallet = walletRepository.findByUser(customer).orElseThrow(() -> new RuntimeException("Khách hàng chưa kích hoạt ví tiền!"));

        BigDecimal price = calculatePrice(request);

        if (customerWallet.getBalance().compareTo(price) < 0) {
            throw new RuntimeException("Số dư ví của khách hàng không đủ để thực hiện chuyến đi!");
        }

        customerWallet.setBalance(customerWallet.getBalance().subtract(price));
        walletRepository.save(customerWallet);

        // Tạo đơn
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
        order.setDistanceKm(request.getDistanceKm().setScale(2, RoundingMode.HALF_UP));
        order.setPrice(price);
        order.setStatus(OrderStatus.PENDING);

        Order savedOrder = orderRepository.save(order);

        sendOrderUpdateRealtime(savedOrder);
        messagingTemplate.convertAndSend("/topic/orders/pending", savedOrder);

        return savedOrder;
    }

    private BigDecimal calculatePrice(CreateOrderRequest request) {
        BigDecimal distance = request.getDistanceKm();
        BigDecimal price = distance.multiply(new BigDecimal("15000"));
        return price.compareTo(new BigDecimal("20000")) < 0 ? new BigDecimal("20000") : price.setScale(0, RoundingMode.HALF_UP);
    }

    public List<DriverProfile> findDriversForOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));
        double radiusMeters = 5000.0;
        return driverProfileRepository.findNearbyAvailableDrivers(order.getPickupLocation(), radiusMeters);
    }

    @Transactional
    public Order acceptOrder(UUID orderId) {
        if (!authUtil.isDriver()) {
            throw new RuntimeException("Chỉ DRIVER được nhận đơn!");
        }

        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Đơn hàng đã được nhận!");
        }

        User driver = userRepository.findById(authUtil.getCurrentUserId())
                .orElseThrow(() -> new RuntimeException("Driver không hợp lệ"));

        order.setDriver(driver);
        order.setStatus(OrderStatus.ACCEPTED);

        String otp = String.format("%04d", new Random().nextInt(10000));
        order.setPickupOtp(otp);

        Order savedOrder = orderRepository.save(order);

        orderRepository.flush();

        Order fullyLoadedOrder = orderRepository.findById(savedOrder.getId())
                .orElse(savedOrder);

        sendOrderUpdateRealtime(fullyLoadedOrder);

        try {
            driverProfileRepository.findByUserId(driver.getId()).ifPresent(profile -> {
                if (profile.getCurrentLocation() != null) {
                    java.util.Map<String, Double> locationData = new java.util.HashMap<>();

                    locationData.put("latitude", profile.getCurrentLocation().getY());
                    locationData.put("longitude", profile.getCurrentLocation().getX());

                    String locationTopic = "/topic/order/" + orderId + "/location";
                    messagingTemplate.convertAndSend(locationTopic, locationData);
                }
            });
        } catch (Exception e) {
        }

        return savedOrder;
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Transactional
    public Order completeOrderWithImage(UUID orderId, MultipartFile podImage) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        if (!order.getDriver().getId().equals(authUtil.getCurrentUserId())) {
            throw new RuntimeException("Không phải đơn của bạn!");
        }

        if (order.getStatus() != OrderStatus.DELIVERING) {
            throw new RuntimeException("Đơn hàng phải ở trạng thái DELIVERING!");
        }

        try {
            // Upload lên Cloudinary
            Map uploadResult = cloudinary.uploader().upload(podImage.getBytes(), ObjectUtils.emptyMap());
            String imageUrl = uploadResult.get("url").toString();

            // Lưu URL vào order
            order.setProofImageUrl(imageUrl);
            order.setProofUploadedAt(LocalDateTime.now());

        } catch (IOException e) {
            throw new RuntimeException("Lỗi upload ảnh lên Cloudinary: " + e.getMessage());
        }

        var driverWallet = walletRepository.findByUser(order.getDriver())
                .orElseThrow(() -> new RuntimeException("Tài xế chưa có ví!"));
        driverWallet.setBalance(driverWallet.getBalance().add(order.getPrice()));
        walletRepository.save(driverWallet);

        order.setStatus(OrderStatus.COMPLETED);
        Order savedOrder = orderRepository.save(order);

        sendOrderUpdateRealtime(savedOrder);

        return savedOrder;
    }

    public List<Order> getOrdersByDriverAndStatus(UUID driverId, OrderStatus status) {
        return orderRepository.findByDriverIdAndStatusOrderByUpdatedAtDesc(driverId, status);
    }

    public List<Order> getOrdersByCustomer(UUID customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional
    public Order startDelivery(UUID orderId, String otp) {
        Order order = orderRepository.findByIdForUpdate(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        if (!order.getDriver().getId().equals(authUtil.getCurrentUserId())) {
            throw new RuntimeException("Không phải đơn của bạn!");
        }

        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new RuntimeException("Chỉ ACCEPTED mới chuyển DELIVERING!");
        }

        if (order.getPickupOtp() == null || !order.getPickupOtp().equals(otp)) {
            throw new RuntimeException("Mã PIN không chính xác!");
        }

        order.setStatus(OrderStatus.DELIVERING);
        Order savedOrder = orderRepository.save(order);

        sendOrderUpdateRealtime(savedOrder);

        return savedOrder;
    }

    @Transactional
    public Order customerCancelOrder(UUID orderId, String reason) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.ACCEPTED) {
            throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái hiện tại!");
        }

        var customerWallet = walletRepository.findByUser(order.getCustomer())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví khách hàng!"));

        customerWallet.setBalance(customerWallet.getBalance().add(order.getPrice()));
        walletRepository.save(customerWallet);

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        sendOrderUpdateRealtime(savedOrder);

        messagingTemplate.convertAndSend("/topic/orders/pending", savedOrder);

        return savedOrder;
    }

    @Transactional
    public Order driverCancelOrder(UUID orderId, String reason) {

        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getDriver() == null ||
                !order.getDriver().getId().equals(authUtil.getCurrentUserId())) {
            throw new RuntimeException("Không phải đơn của bạn!");
        }

        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new RuntimeException(
                    "Không thể hủy sau khi đã lấy hàng");
        }

        order.setStatus(OrderStatus.PENDING);
        order.setDriver(null);

        Order savedOrder = orderRepository.save(order);

        sendOrderUpdateRealtime(savedOrder);
        messagingTemplate.convertAndSend(
                "/topic/orders/pending",
                savedOrder
        );

        return savedOrder;
    }

    public List<Order> getActiveOrdersForDriver(UUID driverId) {
        List<OrderStatus> activeStatuses = List.of(OrderStatus.ACCEPTED, OrderStatus.DELIVERING);
        return orderRepository.findByDriverIdAndStatusInOrderByUpdatedAtDesc(driverId, activeStatuses);
    }

    public Order getOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderId));
    }

    public OrderResponse getOrderDetailsWithDriverLocation(UUID orderId) {
        Order order = getOrderById(orderId);

        OrderResponse response = orderMapper.toResponse(order);

        if (order.getDriver() != null &&
                (OrderStatus.ACCEPTED.equals(order.getStatus()) || OrderStatus.DELIVERING.equals(order.getStatus()))) {

            UUID driverUserId = order.getDriver().getId();

            driverProfileRepository.findByUserId(driverUserId).ifPresent(profile -> {
                if (profile.getCurrentLocation() != null) {
                    response.setDriverLatitude(profile.getCurrentLocation().getY());
                    response.setDriverLongitude(profile.getCurrentLocation().getX());
                }
            });
        }

        return response;
    }
}