package com.university.hotel_management.dto;

public class RoomTypeDTO {
    private Long id;
    private String name;
    private double basePrice;
    private int capacity;
    private String description;

    public RoomTypeDTO() {}

    public RoomTypeDTO(Long id, String name, double basePrice, int capacity, String description) {
        this.id = id;
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
