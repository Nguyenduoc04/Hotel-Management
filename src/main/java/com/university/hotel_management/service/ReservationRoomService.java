package com.university.hotel_management.service;

import com.university.hotel_management.dto.ReservationRoomDTO;
import com.university.hotel_management.model.ReservationRoom;
import com.university.hotel_management.repostory.ReservationRoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReservationRoomService {

    private final ReservationRoomRepository reservationRoomRepository;

    public ReservationRoomService(ReservationRoomRepository reservationRoomRepository) {
        this.reservationRoomRepository = reservationRoomRepository;
    }

    public List<ReservationRoomDTO> getAllReservationRooms() {
        return reservationRoomRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<ReservationRoomDTO> getReservationRoomById(Long id) {
        return reservationRoomRepository.findById(id).map(this::convertToDTO);
    }

    public List<ReservationRoomDTO> getRoomsByReservationId(Long reservationId) {
        return reservationRoomRepository.findByReservationId(reservationId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ReservationRoomDTO convertToDTO(ReservationRoom rr) {
        return new ReservationRoomDTO(
                rr.getId(),
                rr.getReservation() != null ? rr.getReservation().getId() : null,
                rr.getRoom() != null ? rr.getRoom().getId() : null,
                rr.getRoom() != null ? rr.getRoom().getRoomNumber() : null,
                (rr.getRoom() != null && rr.getRoom().getRoomType() != null) ? rr.getRoom().getRoomType().getName() : null,
                rr.getPrice()
        );
    }
}
