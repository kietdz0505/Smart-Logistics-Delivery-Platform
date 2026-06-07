package com.smart.logistic.repository;

import com.smart.logistic.entity.Order;
import com.smart.logistic.entity.OrderStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByStatus(OrderStatus status);

    List<Order> findByDriverIdAndStatusOrderByUpdatedAtDesc(UUID driverId, OrderStatus status);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    List<Order> findByDriverIdAndStatusInOrderByUpdatedAtDesc(UUID driverId, List<OrderStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") UUID id);

    @Query(value = "SELECT * FROM orders o " + "WHERE o.status = 'PENDING' " + "AND ST_DistanceSphere(o.pickup_location, ST_SetSRID(ST_MakePoint(:driverLng, :driverLat), 4326)) <= :radiusInMeters " + "ORDER BY o.created_at DESC", nativeQuery = true)
    List<Order> findPendingOrdersWithinRadius(@Param("driverLat") double driverLat, @Param("driverLng") double driverLng, @Param("radiusInMeters") double radiusInMeters);
}