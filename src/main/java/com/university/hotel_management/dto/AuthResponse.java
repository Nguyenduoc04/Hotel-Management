package com.university.hotel_management.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private Long accountId;
    private Long guestId;
    private Long employeeId;

    public AuthResponse() {}

    public AuthResponse(String token, String username, String role, Long accountId, Long guestId, Long employeeId) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.accountId = accountId;
        this.guestId = guestId;
        this.employeeId = employeeId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public Long getGuestId() { return guestId; }
    public void setGuestId(Long guestId) { this.guestId = guestId; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
}
