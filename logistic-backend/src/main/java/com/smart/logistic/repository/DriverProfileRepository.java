package com.smart.logistic.repository;

import com.smart.logistic.entity.DriverProfile;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DriverProfileRepository extends JpaRepository<DriverProfile, UUID> {

    /**
     * Tìm kiếm tài xế thỏa mãn:
     * 1. Trạng thái đang sẵn sàng nhận đơn ('AVAILABLE')
     * 2. Khoảng cách từ vị trí tài xế tới điểm lấy hàng nhỏ hơn hoặc bằng bán kính cho trước (mét)
     */
    @Query(value = "SELECT * FROM driver_profiles d WHERE d.status = 'AVAILABLE' " +
            "AND ST_DistanceSphere(d.current_location, :pickupLocation) <= :radius",
            nativeQuery = true)
    List<DriverProfile> findNearbyAvailableDrivers(@Param("pickupLocation") Point pickupLocation,
                                                   @Param("radius") double radiusInMeters);
}