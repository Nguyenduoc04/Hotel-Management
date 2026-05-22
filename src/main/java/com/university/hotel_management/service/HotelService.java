package com.university.hotel_management.service;

import com.university.hotel_management.dto.HotelDTO;
import com.university.hotel_management.model.Hotel;
import com.university.hotel_management.repostory.HotelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HotelService {

    private final HotelRepository hotelRepository;

    public HotelService(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    public List<HotelDTO> getAllHotels() {
        return hotelRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<HotelDTO> getHotelById(Long id) {
        return hotelRepository.findById(id).map(this::convertToDTO);
    }

    @Transactional
    public HotelDTO createHotel(HotelDTO dto) {
        Hotel hotel = new Hotel(dto.getName(), dto.getAddress(), dto.getPhone(), dto.getEmail(), dto.getRating());
        Hotel saved = hotelRepository.save(hotel);
        return convertToDTO(saved);
    }

    @Transactional
    public HotelDTO updateHotel(Long id, HotelDTO dto) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        hotel.setName(dto.getName());
        hotel.setAddress(dto.getAddress());
        hotel.setPhone(dto.getPhone());
        hotel.setEmail(dto.getEmail());
        hotel.setRating(dto.getRating());
        Hotel saved = hotelRepository.save(hotel);
        return convertToDTO(saved);
    }

    public void deleteHotel(Long id) {
        hotelRepository.deleteById(id);
    }

    private HotelDTO convertToDTO(Hotel hotel) {
        return new HotelDTO(hotel.getId(), hotel.getName(), hotel.getAddress(), hotel.getPhone(), hotel.getEmail(), hotel.getRating());
    }
}
