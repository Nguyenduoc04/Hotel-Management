package com.university.hotel_management.dto;

import java.time.LocalDateTime;

public class PaymentDTO {
    private Long id;
    private Long reservationId;
    private String guestName;
    private double amount;
    private LocalDateTime paymentDate;
    private String method;
    private String status;

    public PaymentDTO() {}

    public PaymentDTO(Long id, Long reservationId, String guestName, double amount,
                      LocalDateTime paymentDate, String method, String status) {
        this.id = id;
        this.reservationId = reservationId;
        this.guestName = guestName;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.method = method;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
