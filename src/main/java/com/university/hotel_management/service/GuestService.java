package com.university.hotel_management.service;

import com.university.hotel_management.model.Account;
import com.university.hotel_management.model.Guest;
import com.university.hotel_management.repostory.AccountRepository;
import com.university.hotel_management.repostory.GuestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class GuestService {

    private final GuestRepository guestRepository;
    private final AccountRepository accountRepository;

    public GuestService(GuestRepository guestRepository, AccountRepository accountRepository) {
        this.guestRepository = guestRepository;
        this.accountRepository = accountRepository;
    }

    public List<Guest> getAllGuests() {
        return guestRepository.findAll();
    }

    public Optional<Guest> getGuestById(Long id) {
        return guestRepository.findById(id);
    }

    public Optional<Guest> getGuestByAccountId(Long accountId) {
        return guestRepository.findByAccountId(accountId);
    }

    @Transactional
    public Guest createGuest(Guest guest) {
        if (guest.getAccount() != null && guest.getAccount().getId() != null) {
            Account account = accountRepository.findById(guest.getAccount().getId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            guest.setAccount(account);
        }
        return guestRepository.save(guest);
    }

    @Transactional
    public Guest updateGuest(Long id, Guest details) {
        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        guest.setFirstName(details.getFirstName());
        guest.setLastName(details.getLastName());
        guest.setPhone(details.getPhone());
        guest.setEmail(details.getEmail());
        guest.setAddress(details.getAddress());
        guest.setOrigin(details.getOrigin());
        guest.setDob(details.getDob());
        guest.setIdNumber(details.getIdNumber());

        if (details.getAccount() != null && details.getAccount().getId() != null) {
            Account account = accountRepository.findById(details.getAccount().getId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            guest.setAccount(account);
        } else {
            guest.setAccount(null);
        }

        return guestRepository.save(guest);
    }

    public void deleteGuest(Long id) {
        guestRepository.deleteById(id);
    }
}
