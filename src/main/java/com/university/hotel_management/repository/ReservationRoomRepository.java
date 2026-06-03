package com.university.hotel_management.repository;

import com.university.hotel_management.model.ReservationRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRoomRepository extends JpaRepository<ReservationRoom, Long> {
    List<ReservationRoom> findByReservationId(Long reservationId);
}
