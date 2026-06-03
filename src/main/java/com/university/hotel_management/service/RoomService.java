package com.university.hotel_management.service;

import com.university.hotel_management.dto.RoomDTO;
import com.university.hotel_management.model.Hotel;
import com.university.hotel_management.model.Room;
import com.university.hotel_management.model.RoomType;
import com.university.hotel_management.repository.HotelRepository;
import com.university.hotel_management.repository.RoomRepository;
import com.university.hotel_management.repository.RoomTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final HotelRepository hotelRepository;

    public RoomService(RoomRepository roomRepository,
                       RoomTypeRepository roomTypeRepository,
                       HotelRepository hotelRepository) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.hotelRepository = hotelRepository;
    }

    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<RoomDTO> getRoomById(Long id) {
        return roomRepository.findById(id).map(this::convertToDTO);
    }

    public List<RoomDTO> getRoomsByHotelId(Long hotelId) {
        return roomRepository.findByHotelId(hotelId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RoomDTO> getRoomsByRoomTypeId(Long roomTypeId) {
        return roomRepository.findByRoomTypeId(roomTypeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoomDTO createRoom(RoomDTO dto) {
        Room room = new Room();
        room.setRoomNumber(dto.getRoomNumber());
        room.setFloor(dto.getFloor());
        room.setStatus(dto.getStatus() != null ? dto.getStatus() : "AVAILABLE");

        if (dto.getRoomTypeId() != null) {
            RoomType rt = roomTypeRepository.findById(dto.getRoomTypeId())
                    .orElseThrow(() -> new RuntimeException("Room type not found"));
            room.setRoomType(rt);
        } else {
            throw new RuntimeException("Room Type ID is required");
        }

        if (dto.getHotelId() != null) {
            Hotel hotel = hotelRepository.findById(dto.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            room.setHotel(hotel);
        } else {
            throw new RuntimeException("Hotel ID is required");
        }

        Room saved = roomRepository.save(room);
        return convertToDTO(saved);
    }

    @Transactional
    public RoomDTO updateRoom(Long id, RoomDTO dto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        room.setRoomNumber(dto.getRoomNumber());
        room.setFloor(dto.getFloor());
        room.setStatus(dto.getStatus());

        if (dto.getRoomTypeId() != null) {
            RoomType rt = roomTypeRepository.findById(dto.getRoomTypeId())
                    .orElseThrow(() -> new RuntimeException("Room type not found"));
            room.setRoomType(rt);
        }

        if (dto.getHotelId() != null) {
            Hotel hotel = hotelRepository.findById(dto.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            room.setHotel(hotel);
        }

        Room saved = roomRepository.save(room);
        return convertToDTO(saved);
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }

    private RoomDTO convertToDTO(Room room) {
        return new RoomDTO(
                room.getId(),
                room.getRoomNumber(),
                room.getFloor(),
                room.getStatus(),
                room.getRoomType() != null ? room.getRoomType().getId() : null,
                room.getRoomType() != null ? room.getRoomType().getName() : null,
                room.getRoomType() != null ? room.getRoomType().getBasePrice() : 0.0,
                room.getHotel() != null ? room.getHotel().getId() : null,
                room.getHotel() != null ? room.getHotel().getName() : null
        );
    }
}
