package com.university.hotel_management.config;

import com.university.hotel_management.repostory.AccountRepository;
import com.university.hotel_management.model.Account;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final AccountRepository accountRepository;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider, AccountRepository accountRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.accountRepository = accountRepository;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
            return User.builder()
                    .username(account.getUsername())
                    .password(account.getPassword())
                    .roles(account.getRole())
                    .build();
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService());
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public pages (Thymeleaf HTML templates)
                .requestMatchers("/", "/login", "/home", "/dashboard", "/client", "/hotels", "/reservation",
                                 "/setting", "/payment", "/room/**").permitAll()
                // Public static assets
                .requestMatchers("/assets/**", "/*.css", "/*.js", "/*.jpg", "/*.png",
                                 "/*.svg", "/*.ico", "/favicon.ico").permitAll()
                // Public auth API
                .requestMatchers("/api/auth/**").permitAll()
                // Public read APIs (frontend loads data without login for demo)
                .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                // Everything else needs a valid JWT
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
