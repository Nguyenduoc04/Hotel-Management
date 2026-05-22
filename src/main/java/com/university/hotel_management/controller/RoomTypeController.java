package com.university.hotel_management.controller;

import com.university.hotel_management.dto.RoomTypeDTO;
import com.university.hotel_management.service.RoomTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-types")
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    public RoomTypeController(RoomTypeService roomTypeService) {
        this.roomTypeService = roomTypeService;
    }

    @GetMapping
    public ResponseEntity<List<RoomTypeDTO>> getAllRoomTypes() {
        return ResponseEntity.ok(roomTypeService.getAllRoomTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomTypeDTO> getRoomTypeById(@PathVariable Long id) {
        return roomTypeService.getRoomTypeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RoomTypeDTO> createRoomType(@RequestBody RoomTypeDTO dto) {
        return ResponseEntity.ok(roomTypeService.createRoomType(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomTypeDTO> updateRoomType(@PathVariable Long id, @RequestBody RoomTypeDTO dto) {
        try {
            return ResponseEntity.ok(roomTypeService.updateRoomType(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoomType(@PathVariable Long id) {
        roomTypeService.deleteRoomType(id);
        return ResponseEntity.ok().build();
    }
}
