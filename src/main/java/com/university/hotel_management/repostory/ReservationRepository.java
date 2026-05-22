package com.university.hotel_management.repostory;

import com.university.hotel_management.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByGuestId(Long guestId);
    List<Reservation> findByHotelId(Long hotelId);
}
