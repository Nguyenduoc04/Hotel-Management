package com.university.hotel_management.service;

import com.university.hotel_management.dto.PaymentDTO;
import com.university.hotel_management.model.Payment;
import com.university.hotel_management.model.Reservation;
import com.university.hotel_management.repository.PaymentRepository;
import com.university.hotel_management.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;

    public PaymentService(PaymentRepository paymentRepository, ReservationRepository reservationRepository) {
        this.paymentRepository = paymentRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<PaymentDTO> getPaymentById(Long id) {
        return paymentRepository.findById(id).map(this::convertToDTO);
    }

    public List<PaymentDTO> getPaymentsByReservationId(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentDTO createPayment(PaymentDTO dto) {
        Reservation reservation = reservationRepository.findById(dto.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        Payment payment = new Payment();
        payment.setReservation(reservation);
        payment.setAmount(dto.getAmount());
        payment.setPaymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDateTime.now());
        payment.setMethod(dto.getMethod() != null ? dto.getMethod() : "CASH");
        payment.setStatus(dto.getStatus() != null ? dto.getStatus() : "PAID");

        // Update reservation status to PAID
        reservation.setStatus("PAID");
        reservationRepository.save(reservation);

        Payment saved = paymentRepository.save(payment);
        return convertToDTO(saved);
    }

    @Transactional
    public PaymentDTO updatePayment(Long id, PaymentDTO dto) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setAmount(dto.getAmount());
        if (dto.getPaymentDate() != null) {
            payment.setPaymentDate(dto.getPaymentDate());
        }
        if (dto.getMethod() != null) {
            payment.setMethod(dto.getMethod());
        }
        if (dto.getStatus() != null) {
            payment.setStatus(dto.getStatus());
        }

        Payment saved = paymentRepository.save(payment);
        return convertToDTO(saved);
    }

    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }

    private PaymentDTO convertToDTO(Payment payment) {
        String guestName = "";
        if (payment.getReservation() != null && payment.getReservation().getGuest() != null) {
            guestName = payment.getReservation().getGuest().getFirstName() + " " + payment.getReservation().getGuest().getLastName();
        }
        return new PaymentDTO(
                payment.getId(),
                payment.getReservation() != null ? payment.getReservation().getId() : null,
                guestName,
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getMethod(),
                payment.getStatus()
        );
    }
}
