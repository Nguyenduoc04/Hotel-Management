package com.university.hotel_management.service;

import com.university.hotel_management.config.JwtTokenProvider;
import com.university.hotel_management.dto.AuthResponse;
import com.university.hotel_management.dto.LoginRequest;
import com.university.hotel_management.dto.RegisterGuestRequest;
import com.university.hotel_management.model.Account;
import com.university.hotel_management.model.Employee;
import com.university.hotel_management.model.Guest;
import com.university.hotel_management.repostory.AccountRepository;
import com.university.hotel_management.repostory.EmployeeRepository;
import com.university.hotel_management.repostory.GuestRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final GuestRepository guestRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AccountService(AccountRepository accountRepository,
                          GuestRepository guestRepository,
                          EmployeeRepository employeeRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider jwtTokenProvider,
                          AuthenticationManager authenticationManager) {
        this.accountRepository = accountRepository;
        this.guestRepository = guestRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Optional<Account> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    public Optional<Account> getAccountByUsername(String username) {
        return accountRepository.findByUsername(username);
    }

    @Transactional
    public Account createAccount(Account account) {
        if (accountRepository.existsByUsername(account.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (accountRepository.existsByEmail(account.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        account.setPassword(passwordEncoder.encode(account.getPassword()));
        return accountRepository.save(account);
    }

    @Transactional
    public Account updateAccount(Long id, Account updatedDetails) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUsername().equals(updatedDetails.getUsername()) &&
                accountRepository.existsByUsername(updatedDetails.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (!account.getEmail().equals(updatedDetails.getEmail()) &&
                accountRepository.existsByEmail(updatedDetails.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        account.setUsername(updatedDetails.getUsername());
        if (updatedDetails.getPassword() != null && !updatedDetails.getPassword().isEmpty()
                && !updatedDetails.getPassword().startsWith("$2a$")) { // Check if already encrypted
            account.setPassword(passwordEncoder.encode(updatedDetails.getPassword()));
        }
        account.setEmail(updatedDetails.getEmail());
        account.setRole(updatedDetails.getRole());
        account.setActive(updatedDetails.isActive());

        return accountRepository.save(account);
    }

    public void deleteAccount(Long id) {
        accountRepository.deleteById(id);
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication.getName());

        Account account = accountRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Account not found after authentication"));

        Long guestId = guestRepository.findByAccountId(account.getId()).map(Guest::getId).orElse(null);
        Long employeeId = employeeRepository.findByAccountId(account.getId()).map(Employee::getId).orElse(null);

        return new AuthResponse(token, account.getUsername(), account.getRole(), account.getId(), guestId, employeeId);
    }

    @Transactional
    public AuthResponse registerGuest(RegisterGuestRequest request) {
        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // 1. Create account
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setEmail(request.getEmail());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setRole("GUEST");
        account.setActive(true);
        Account savedAccount = accountRepository.save(account);

        // 2. Create guest profile
        Guest guest = new Guest();
        guest.setAccount(savedAccount);
        guest.setFirstName(request.getFirstName() != null ? request.getFirstName() : request.getUsername());
        guest.setLastName(request.getLastName() != null ? request.getLastName() : "");
        guest.setPhone(request.getPhone() != null ? request.getPhone() : "");
        guest.setEmail(request.getEmail());
        guest.setIdNumber(request.getIdNumber());
        guest.setAddress(request.getAddress());
        guest.setOrigin(request.getOrigin());
        if (request.getDob() != null && !request.getDob().isEmpty()) {
            try {
                guest.setDob(LocalDate.parse(request.getDob()));
            } catch (Exception ignored) {}
        }
        Guest savedGuest = guestRepository.save(guest);

        // 3. Generate token
        String token = jwtTokenProvider.generateToken(savedAccount.getUsername());

        return new AuthResponse(token, savedAccount.getUsername(), savedAccount.getRole(), savedAccount.getId(), savedGuest.getId(), null);
    }
}
