package com.university.hotel_management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "room_type")
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "base_price", nullable = false)
    private double basePrice;

    @Column(nullable = false)
    private int capacity = 1;

    @Column(length = 255)
    private String description;

    public RoomType() {}

    public RoomType(String name, double basePrice, int capacity, String description) {
        this.name = name;
        this.basePrice = basePrice;
        this.capacity = capacity;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
