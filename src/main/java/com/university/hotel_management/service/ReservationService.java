package com.university.hotel_management.service;

import com.university.hotel_management.dto.ReservationDTO;
import com.university.hotel_management.dto.ReservationRoomDTO;
import com.university.hotel_management.model.*;
import com.university.hotel_management.repostory.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;
    private final HotelRepository hotelRepository;
    private final EmployeeRepository employeeRepository;
    private final RoomRepository roomRepository;
    private final ReservationRoomRepository reservationRoomRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              GuestRepository guestRepository,
                              HotelRepository hotelRepository,
                              EmployeeRepository employeeRepository,
                              RoomRepository roomRepository,
                              ReservationRoomRepository reservationRoomRepository) {
        this.reservationRepository = reservationRepository;
        this.guestRepository = guestRepository;
        this.hotelRepository = hotelRepository;
        this.employeeRepository = employeeRepository;
        this.roomRepository = roomRepository;
        this.reservationRoomRepository = reservationRoomRepository;
    }

    public List<ReservationDTO> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<ReservationDTO> getReservationById(Long id) {
        return reservationRepository.findById(id).map(this::convertToDTO);
    }

    public List<ReservationDTO> getReservationsByGuestId(Long guestId) {
        return reservationRepository.findByGuestId(guestId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservationDTO createReservation(ReservationDTO dto) {
        Reservation res = new Reservation();

        Guest guest = guestRepository.findById(dto.getGuestId())
                .orElseThrow(() -> new RuntimeException("Guest not found"));
        res.setGuest(guest);

        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        res.setHotel(hotel);

        res.setCheckIn(dto.getCheckIn());
        res.setCheckOut(dto.getCheckOut());
        res.setStatus(dto.getStatus() != null ? dto.getStatus() : "BOOKED");

        if (dto.getInChargeEmployeeId() != null) {
            Employee employee = employeeRepository.findById(dto.getInChargeEmployeeId()).orElse(null);
            res.setInChargeEmployee(employee);
        }

        // Save reservation initially to obtain id
        Reservation savedRes = reservationRepository.save(res);

        // Add rooms
        double totalAmount = 0;
        long days = ChronoUnit.DAYS.between(dto.getCheckIn(), dto.getCheckOut());
        if (days <= 0) days = 1; // Minimum 1 day

        List<ReservationRoom> savedRooms = new ArrayList<>();
        if (dto.getRooms() != null) {
            for (ReservationRoomDTO rDto : dto.getRooms()) {
                Room room = roomRepository.findById(rDto.getRoomId())
                        .orElseThrow(() -> new RuntimeException("Room not found: " + rDto.getRoomId()));

                double pricePerNight = room.getRoomType().getBasePrice();
                double totalPriceForRoom = pricePerNight * days;

                ReservationRoom rr = new ReservationRoom(savedRes, room, totalPriceForRoom);
                ReservationRoom savedRr = reservationRoomRepository.save(rr);
                savedRooms.add(savedRr);

                totalAmount += totalPriceForRoom;

                // Update Room status to OCCUPIED or BOOKED if checking in or booking
                if ("CHECKED_IN".equalsIgnoreCase(savedRes.getStatus())) {
                    room.setStatus("OCCUPIED");
                } else if ("BOOKED".equalsIgnoreCase(savedRes.getStatus())) {
                    room.setStatus("AVAILABLE"); // Or booked depending on business rule
                }
                roomRepository.save(room);
            }
        }

        savedRes.setTotalAmount(totalAmount);
        Reservation finalRes = reservationRepository.save(savedRes);
        return convertToDTO(finalRes);
    }

    @Transactional
    public ReservationDTO updateReservation(Long id, ReservationDTO dto) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        res.setCheckIn(dto.getCheckIn());
        res.setCheckOut(dto.getCheckOut());

        String oldStatus = res.getStatus();
        res.setStatus(dto.getStatus());

        if (dto.getInChargeEmployeeId() != null) {
            Employee employee = employeeRepository.findById(dto.getInChargeEmployeeId()).orElse(null);
            res.setInChargeEmployee(employee);
        }

        // If status changed to COMPLETED or CANCELLED, set rooms back to AVAILABLE or CLEANING
        if (!oldStatus.equals(dto.getStatus())) {
            List<ReservationRoom> reservationRooms = reservationRoomRepository.findByReservationId(res.getId());
            for (ReservationRoom rr : reservationRooms) {
                Room room = rr.getRoom();
                if ("COMPLETED".equalsIgnoreCase(dto.getStatus())) {
                    room.setStatus("CLEANING");
                } else if ("CANCELLED".equalsIgnoreCase(dto.getStatus())) {
                    room.setStatus("AVAILABLE");
                } else if ("CHECKED_IN".equalsIgnoreCase(dto.getStatus())) {
                    room.setStatus("OCCUPIED");
                }
                roomRepository.save(room);
            }
        }

        Reservation saved = reservationRepository.save(res);
        return convertToDTO(saved);
    }

    public void deleteReservation(Long id) {
        // Free up room statuses before delete
        List<ReservationRoom> rrs = reservationRoomRepository.findByReservationId(id);
        for (ReservationRoom rr : rrs) {
            Room room = rr.getRoom();
            room.setStatus("AVAILABLE");
            roomRepository.save(room);
            reservationRoomRepository.delete(rr);
        }
        reservationRepository.deleteById(id);
    }

    private ReservationDTO convertToDTO(Reservation res) {
        ReservationDTO dto = new ReservationDTO();
        dto.setId(res.getId());
        if (res.getGuest() != null) {
            dto.setGuestId(res.getGuest().getId());
            dto.setGuestName(res.getGuest().getFirstName() + " " + res.getGuest().getLastName());
        }
        if (res.getHotel() != null) {
            dto.setHotelId(res.getHotel().getId());
            dto.setHotelName(res.getHotel().getName());
        }
        dto.setCheckIn(res.getCheckIn());
        dto.setCheckOut(res.getCheckOut());
        dto.setTotalAmount(res.getTotalAmount());
        dto.setStatus(res.getStatus());
        if (res.getInChargeEmployee() != null) {
            dto.setInChargeEmployeeId(res.getInChargeEmployee().getId());
            dto.setInChargeEmployeeName(res.getInChargeEmployee().getFirstName() + " " + res.getInChargeEmployee().getLastName());
        }

        List<ReservationRoom> rrs = reservationRoomRepository.findByReservationId(res.getId());
        List<ReservationRoomDTO> rDtos = rrs.stream().map(rr -> new ReservationRoomDTO(
                rr.getId(),
                res.getId(),
                rr.getRoom().getId(),
                rr.getRoom().getRoomNumber(),
                rr.getRoom().getRoomType().getName(),
                rr.getPrice()
        )).collect(Collectors.toList());

        dto.setRooms(rDtos);
        return dto;
    }
}
