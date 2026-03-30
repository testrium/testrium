package com.testrium.manager.controller;

import com.testrium.manager.entity.User;
import com.testrium.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Returns whether any admin user has been created yet.
     * Used by the frontend to decide whether to show the setup screen.
     */
    @GetMapping("/admin-exists")
    public ResponseEntity<?> adminExists() {
        boolean exists = userRepository.findAll().stream()
                .anyMatch(u -> "ADMIN".equals(u.getRole()));
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    /**
     * First-time setup: create the initial admin with a custom email and password.
     * Blocked if any admin already exists.
     */
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> body) {
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> "ADMIN".equals(u.getRole()));

        if (adminExists) {
            return ResponseEntity.badRequest().body(Map.of("message", "Admin already exists"));
        }

        String email = body.get("email");
        String password = body.get("password");
        String username = body.get("username");

        if (email == null || email.isBlank() || password == null || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Valid email and password (min 6 chars) are required"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }

        if (username == null || username.isBlank()) {
            username = email.substring(0, email.indexOf("@"));
        }

        User admin = new User();
        admin.setUsername(username);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole("ADMIN");
        admin.setEmailVerified(true);
        userRepository.save(admin);

        return ResponseEntity.ok(Map.of("message", "Admin created successfully"));
    }
}
