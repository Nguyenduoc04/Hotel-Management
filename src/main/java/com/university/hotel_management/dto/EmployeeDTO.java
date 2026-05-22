package com.university.hotel_management.dto;

import java.time.LocalDate;

public class EmployeeDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String position;
    private double salary;
    private String phone;
    private LocalDate hireDate;
    private LocalDate dob;
    private String idNumber;
    private Long hotelId;
    private String hotelName;
    private Long accountId;
    private String username;

    public EmployeeDTO() {}

    public EmployeeDTO(Long id, String firstName, String lastName, String position, double salary,
                       String phone, LocalDate hireDate, LocalDate dob, String idNumber,
                       Long hotelId, String hotelName, Long accountId, String username) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.position = position;
        this.salary = salary;
        this.phone = phone;
        this.hireDate = hireDate;
        this.dob = dob;
        this.idNumber = idNumber;
        this.hotelId = hotelId;
        this.hotelName = hotelName;
        this.accountId = accountId;
        this.username = username;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public double getSalary() { return salary; }
    public void setSalary(double salary) { this.salary = salary; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public String getIdNumber() { return idNumber; }
    public void setIdNumber(String idNumber) { this.idNumber = idNumber; }
    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }
    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
