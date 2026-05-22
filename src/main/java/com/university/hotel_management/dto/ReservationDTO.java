package com.university.hotel_management.dto;

import java.time.LocalDate;
import java.util.List;

public class ReservationDTO {
    private Long id;
    private Long guestId;
    private String guestName;
    private Long hotelId;
    private String hotelName;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private double totalAmount;
    private String status;
    private Long inChargeEmployeeId;
    private String inChargeEmployeeName;
    private List<ReservationRoomDTO> rooms;

    public ReservationDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getGuestId() { return guestId; }
    public void setGuestId(Long guestId) { this.guestId = guestId; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }
    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }
    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getInChargeEmployeeId() { return inChargeEmployeeId; }
    public void setInChargeEmployeeId(Long inChargeEmployeeId) { this.inChargeEmployeeId = inChargeEmployeeId; }
    public String getInChargeEmployeeName() { return inChargeEmployeeName; }
    public void setInChargeEmployeeName(String inChargeEmployeeName) { this.inChargeEmployeeName = inChargeEmployeeName; }
    public List<ReservationRoomDTO> getRooms() { return rooms; }
    public void setRooms(List<ReservationRoomDTO> rooms) { this.rooms = rooms; }
}
