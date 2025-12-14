package com.pramana.manager.controller;

import com.pramana.manager.entity.User;
import com.pramana.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for creating admin user
 * WARNING: This endpoint should be disabled or secured in production
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${admin.default.email:admin@pramana.com}")
    private String adminEmail;

    @Value("${admin.default.password:admin123}")
    private String adminPassword;

    /**
     * Create initial admin user from configuration
     * Uses credentials from client-config.properties
     */
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin() {
        // Extract username from email
        String username = adminEmail.substring(0, adminEmail.indexOf("@"));

        // Check if admin already exists
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admin user already exists");
            response.put("email", adminEmail);
            return ResponseEntity.badRequest().body(response);
        }

        // Create admin user with configured credentials
        User admin = new User();
        admin.setUsername(username);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole("ADMIN");
        admin.setEmailVerified(true);

        userRepository.save(admin);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin user created successfully");
        response.put("email", adminEmail);
        response.put("username", username);
        response.put("warning", "Please change the password after first login");

        return ResponseEntity.ok(response);
    }

    /**
     * Check if admin exists
     */
    @GetMapping("/admin-exists")
    public ResponseEntity<?> adminExists() {
        boolean exists = userRepository.findByUsername("admin").isPresent();
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
}
