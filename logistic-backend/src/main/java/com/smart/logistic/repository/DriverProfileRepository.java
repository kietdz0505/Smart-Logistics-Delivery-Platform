package com.smart.logistic.repository;

import com.smart.logistic.entity.DriverProfile;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverProfileRepository extends JpaRepository<DriverProfile, UUID> {


    Optional<DriverProfile> findByUserId(UUID userId);

    @Query(value = "SELECT * FROM driver_profiles d WHERE d.status = 'AVAILABLE' " + "AND ST_DistanceSphere(d.current_location, :pickupLocation) <= :radius", nativeQuery = true)
    List<DriverProfile> findNearbyAvailableDrivers(@Param("pickupLocation") Point pickupLocation, @Param("radius") double radiusInMeters);
}