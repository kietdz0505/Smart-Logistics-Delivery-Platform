package com.smart.logistic.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"orders", "password", "wallet"})
    private User customer;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    @JsonIgnoreProperties({"orders", "password", "wallet"})
    private User driver;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "sender_phone")
    private String senderPhone;

    @Column(name = "receiver_name")
    private String receiverName;

    @Column(name = "receiver_phone")
    private String receiverPhone;

    @JsonIgnore
    @Column(name = "pickup_location", columnDefinition = "geometry(Point,4326)")
    private Point pickupLocation;

    @JsonIgnore
    @Column(name = "delivery_location", columnDefinition = "geometry(Point,4326)")
    private Point deliveryLocation;

    @Column(name = "pickup_address")
    private String pickupAddress;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "distance_km")
    private BigDecimal distanceKm;

    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "pickup_otp", length = 4)
    private String pickupOtp;

    @Column(name = "proof_image_url", length = 500)
    private String proofImageUrl;

    @Column(name = "proof_uploaded_at")
    private LocalDateTime proofUploadedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}