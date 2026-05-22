package com.university.hotel_management.service;

import com.university.hotel_management.dto.RoomTypeDTO;
import com.university.hotel_management.model.RoomType;
import com.university.hotel_management.repostory.RoomTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;

    public RoomTypeService(RoomTypeRepository roomTypeRepository) {
        this.roomTypeRepository = roomTypeRepository;
    }

    public List<RoomTypeDTO> getAllRoomTypes() {
        return roomTypeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<RoomTypeDTO> getRoomTypeById(Long id) {
        return roomTypeRepository.findById(id).map(this::convertToDTO);
    }

    @Transactional
    public RoomTypeDTO createRoomType(RoomTypeDTO dto) {
        RoomType rt = new RoomType(dto.getName(), dto.getBasePrice(), dto.getCapacity(), dto.getDescription());
        RoomType saved = roomTypeRepository.save(rt);
        return convertToDTO(saved);
    }

    @Transactional
    public RoomTypeDTO updateRoomType(Long id, RoomTypeDTO dto) {
        RoomType rt = roomTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room type not found"));
        rt.setName(dto.getName());
        rt.setBasePrice(dto.getBasePrice());
        rt.setCapacity(dto.getCapacity());
        rt.setDescription(dto.getDescription());
        RoomType saved = roomTypeRepository.save(rt);
        return convertToDTO(saved);
    }

    public void deleteRoomType(Long id) {
        roomTypeRepository.deleteById(id);
    }

    private RoomTypeDTO convertToDTO(RoomType rt) {
        return new RoomTypeDTO(rt.getId(), rt.getName(), rt.getBasePrice(), rt.getCapacity(), rt.getDescription());
    }
}
