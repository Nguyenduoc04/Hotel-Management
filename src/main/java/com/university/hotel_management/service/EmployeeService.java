package com.university.hotel_management.service;

import com.university.hotel_management.dto.EmployeeDTO;
import com.university.hotel_management.model.Account;
import com.university.hotel_management.model.Employee;
import com.university.hotel_management.model.Hotel;
import com.university.hotel_management.repository.AccountRepository;
import com.university.hotel_management.repository.EmployeeRepository;
import com.university.hotel_management.repository.HotelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final HotelRepository hotelRepository;
    private final AccountRepository accountRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
                           HotelRepository hotelRepository,
                           AccountRepository accountRepository) {
        this.employeeRepository = employeeRepository;
        this.hotelRepository = hotelRepository;
        this.accountRepository = accountRepository;
    }

    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<EmployeeDTO> getEmployeeById(Long id) {
        return employeeRepository.findById(id).map(this::convertToDTO);
    }

    public Optional<EmployeeDTO> getEmployeeByAccountId(Long accountId) {
        return employeeRepository.findByAccountId(accountId).map(this::convertToDTO);
    }

    @Transactional
    public EmployeeDTO createEmployee(EmployeeDTO dto) {
        Employee employee = new Employee();
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setPosition(dto.getPosition());
        employee.setSalary(dto.getSalary());
        employee.setPhone(dto.getPhone());
        employee.setHireDate(dto.getHireDate());
        employee.setDob(dto.getDob());
        employee.setIdNumber(dto.getIdNumber());

        if (dto.getHotelId() != null) {
            Hotel hotel = hotelRepository.findById(dto.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            employee.setHotel(hotel);
        } else {
            throw new RuntimeException("Hotel ID is required for employee");
        }

        if (dto.getAccountId() != null) {
            Account account = accountRepository.findById(dto.getAccountId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            employee.setAccount(account);
        }

        Employee saved = employeeRepository.save(employee);
        return convertToDTO(saved);
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setPosition(dto.getPosition());
        employee.setSalary(dto.getSalary());
        employee.setPhone(dto.getPhone());
        employee.setHireDate(dto.getHireDate());
        employee.setDob(dto.getDob());
        employee.setIdNumber(dto.getIdNumber());

        if (dto.getHotelId() != null) {
            Hotel hotel = hotelRepository.findById(dto.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            employee.setHotel(hotel);
        }

        if (dto.getAccountId() != null) {
            Account account = accountRepository.findById(dto.getAccountId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            employee.setAccount(account);
        } else {
            employee.setAccount(null);
        }

        Employee saved = employeeRepository.save(employee);
        return convertToDTO(saved);
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }

    private EmployeeDTO convertToDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(employee.getId());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setPosition(employee.getPosition());
        dto.setSalary(employee.getSalary());
        dto.setPhone(employee.getPhone());
        dto.setHireDate(employee.getHireDate());
        dto.setDob(employee.getDob());
        dto.setIdNumber(employee.getIdNumber());
        if (employee.getHotel() != null) {
            dto.setHotelId(employee.getHotel().getId());
            dto.setHotelName(employee.getHotel().getName());
        }
        if (employee.getAccount() != null) {
            dto.setAccountId(employee.getAccount().getId());
            dto.setUsername(employee.getAccount().getUsername());
        }
        return dto;
    }
}
