package com.smart.logistic.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "driver_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DriverProfile {

    @Id
    private UUID id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @Column(name = "vehicle_number", nullable = false)
    private String vehicleNumber;

    @Column(name = "vehicle_type", nullable = false)
    private String vehicleType;

    @Column(nullable = false)
    private String status;

    @Column(name = "current_location", columnDefinition = "geometry(Point,4326)")
    private Point currentLocation; // Tọa độ GPS hiện tại của tài xế
}