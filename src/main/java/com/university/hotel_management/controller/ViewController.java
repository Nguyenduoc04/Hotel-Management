package com.university.hotel_management.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/")
    public String index() {
        return "redirect:/home";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "index"; // index.html is the dashboard
    }

    @GetMapping("/client")
    public String client() {
        return "client"; // client.html (Guest management)
    }

    @GetMapping("/hotels")
    public String hotels() {
        return "hotels";
    }

    @GetMapping("/reservation")
    public String reservation() {
        return "reservation";
    }

    @GetMapping("/setting")
    public String setting() {
        return "setting";
    }

    @GetMapping("/home")
    public String home() {
        return "guest"; // guest-facing booking page (guest.html)
    }

    @GetMapping("/payment")
    public String payment(@org.springframework.web.bind.annotation.RequestParam(name = "reservationId", required = false) Long reservationId, org.springframework.ui.Model model) {
        model.addAttribute("reservationId", reservationId);
        return "payment";
    }

    @GetMapping("/room")
    public String room(@org.springframework.web.bind.annotation.RequestParam(name = "hotelId", required = false) Long hotelId, org.springframework.ui.Model model) {
        model.addAttribute("hotelId", hotelId != null ? hotelId : 1L);
        return "room";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "authentication";
    }
}
