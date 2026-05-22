package com.university.hotel_management.dto;

public class ReservationRoomDTO {
    private Long id;
    private Long reservationId;
    private Long roomId;
    private String roomNumber;
    private String roomTypeName;
    private double price;

    public ReservationRoomDTO() {}

    public ReservationRoomDTO(Long id, Long reservationId, Long roomId, String roomNumber, String roomTypeName, double price) {
        this.id = id;
        this.reservationId = reservationId;
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.roomTypeName = roomTypeName;
        this.price = price;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getRoomTypeName() { return roomTypeName; }
    public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}
