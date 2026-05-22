package com.university.hotel_management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "reservation_room")
public class ReservationRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false)
    private double price = 0.0;

    public ReservationRoom() {}

    public ReservationRoom(Reservation reservation, Room room, double price) {
        this.reservation = reservation;
        this.room = room;
        this.price = price;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }
    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}
