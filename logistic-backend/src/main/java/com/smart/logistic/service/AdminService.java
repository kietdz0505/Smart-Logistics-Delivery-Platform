package com.smart.logistic.service;

import com.smart.logistic.dto.AdminDashboardResponse;
import com.smart.logistic.entity.DriverApprovalStatus;
import com.smart.logistic.entity.OrderStatus;
import com.smart.logistic.repository.DriverProfileRepository;
import com.smart.logistic.repository.OrderRepository;
import com.smart.logistic.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final UserRepository userRepository;

    private final DriverProfileRepository driverProfileRepository;

    private final OrderRepository orderRepository;

    public AdminService(UserRepository userRepository, DriverProfileRepository driverProfileRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.driverProfileRepository = driverProfileRepository;
        this.orderRepository = orderRepository;
    }

    public AdminDashboardResponse getDashboard() {

        AdminDashboardResponse response =
                new AdminDashboardResponse();

        response.setTotalUsers(
                userRepository.countByRole_Name("ROLE_CUSTOMER")
        );

        response.setTotalDrivers(
                userRepository.countByRole_Name("ROLE_DRIVER")
        );

        response.setPendingDrivers(
                driverProfileRepository.countByApprovalStatus(
                        DriverApprovalStatus.PENDING
                )
        );

        response.setTotalOrders(
                orderRepository.count()
        );

        response.setPendingOrders(
                orderRepository.countByStatus(
                        OrderStatus.PENDING
                )
        );

        response.setAcceptedOrders(
                orderRepository.countByStatus(
                        OrderStatus.ACCEPTED
                )
        );

        response.setDeliveringOrders(
                orderRepository.countByStatus(
                        OrderStatus.DELIVERING
                )
        );

        response.setCompletedOrders(
                orderRepository.countByStatus(
                        OrderStatus.COMPLETED
                )
        );

        response.setCancelledOrders(
                orderRepository.countByStatus(
                        OrderStatus.CANCELLED
                )
        );

        response.setFailedOrders(
                orderRepository.countByStatus(
                        OrderStatus.FAILED
                )
        );

        response.setTotalRevenue(
                orderRepository.getTotalRevenue()
        );

        return response;
    }
}