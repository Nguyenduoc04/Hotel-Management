package com.university.hotel_management.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "reservation")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    @Column(name = "total_amount", nullable = false)
    private double totalAmount = 0.0;

    @Column(nullable = false, length = 20)
    private String status = "BOOKED"; // BOOKED | CHECKED_IN | COMPLETED | CANCELLED | NO_SHOW

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "in_charge_employee_id")
    private Employee inChargeEmployee;

    public Reservation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Guest getGuest() { return guest; }
    public void setGuest(Guest guest) { this.guest = guest; }
    public Hotel getHotel() { return hotel; }
    public void setHotel(Hotel hotel) { this.hotel = hotel; }
    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Employee getInChargeEmployee() { return inChargeEmployee; }
    public void setInChargeEmployee(Employee inChargeEmployee) { this.inChargeEmployee = inChargeEmployee; }
}
