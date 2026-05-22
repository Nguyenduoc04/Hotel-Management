package com.university.hotel_management.dto;

public class HotelDTO {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private String email;
    private double rating;

    public HotelDTO() {}

    public HotelDTO(Long id, String name, String address, String phone, String email, double rating) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.rating = rating;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
}
