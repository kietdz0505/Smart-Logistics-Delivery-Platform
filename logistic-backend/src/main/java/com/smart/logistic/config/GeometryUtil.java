package com.smart.logistic.config;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

public class GeometryUtil {

    // Hệ tọa độ WGS84 chuẩn quốc tế (được Google Maps, Mapbox, GPS toàn cầu sử dụng)
    private static final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public static Point createPoint(double longitude, double latitude) {
        // JTS Geometry quy định thứ tự truyền vào là (Kinh độ - Longitude, Vĩ độ - Latitude)
        return geometryFactory.createPoint(new Coordinate(longitude, latitude));
    }
}