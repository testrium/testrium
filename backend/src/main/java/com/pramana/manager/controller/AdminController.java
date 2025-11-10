package com.pramana.manager.controller;

import com.pramana.manager.entity.User;
import com.pramana.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    /**
     * Create initial admin user
     * This endpoint is intentionally open to allow creating the first admin user
     * Call this once to create admin account, then disable this endpoint
     */
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin() {
        // Check if admin already exists
        if (userRepository.findByUsername("admin").isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admin user already exists");
            response.put("username", "admin");
            return ResponseEntity.badRequest().body(response);
        }

        // Create admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@pramana.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole("ADMIN");

        userRepository.save(admin);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin user created successfully");
        response.put("username", "admin");
        response.put("password", "admin123");
        response.put("email", "admin@pramana.com");
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
