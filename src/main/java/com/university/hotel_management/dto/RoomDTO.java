package com.university.hotel_management.dto;

public class RoomDTO {
    private Long id;
    private String roomNumber;
    private int floor;
    private String status;
    private Long roomTypeId;
    private String roomTypeName;
    private double basePrice;
    private Long hotelId;
    private String hotelName;

    public RoomDTO() {}

    public RoomDTO(Long id, String roomNumber, int floor, String status,
                   Long roomTypeId, String roomTypeName, double basePrice,
                   Long hotelId, String hotelName) {
        this.id = id;
        this.roomNumber = roomNumber;
        this.floor = floor;
        this.status = status;
        this.roomTypeId = roomTypeId;
        this.roomTypeName = roomTypeName;
        this.basePrice = basePrice;
        this.hotelId = hotelId;
        this.hotelName = hotelName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public int getFloor() { return floor; }
    public void setFloor(int floor) { this.floor = floor; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getRoomTypeId() { return roomTypeId; }
    public void setRoomTypeId(Long roomTypeId) { this.roomTypeId = roomTypeId; }
    public String getRoomTypeName() { return roomTypeName; }
    public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }
    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }
    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }
    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }
}
