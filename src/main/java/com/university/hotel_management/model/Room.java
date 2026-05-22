package com.university.hotel_management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "room")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_number", nullable = false, length = 20)
    private String roomNumber;

    @Column(nullable = false)
    private int floor = 1;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE"; // AVAILABLE | OCCUPIED | CLEANING | MAINTENANCE

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    public Room() {}

    public Room(String roomNumber, int floor, String status, RoomType roomType, Hotel hotel) {
        this.roomNumber = roomNumber;
        this.floor = floor;
        this.status = status;
        this.roomType = roomType;
        this.hotel = hotel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public int getFloor() { return floor; }
    public void setFloor(int floor) { this.floor = floor; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public RoomType getRoomType() { return roomType; }
    public void setRoomType(RoomType roomType) { this.roomType = roomType; }
    public Hotel getHotel() { return hotel; }
    public void setHotel(Hotel hotel) { this.hotel = hotel; }
}
