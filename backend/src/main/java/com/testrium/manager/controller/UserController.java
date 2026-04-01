package com.testrium.manager.controller;

import com.testrium.manager.dto.UserDTO;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> userDTOs = users.stream()
                .map(u -> new UserDTO(u.getId(), u.getUsername(), u.getEmail(), u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole()));
    }

    /** Admin: create a new user with a specified role */
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String username = body.get("username");
        String password = body.get("password");
        String role     = body.get("role");

        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        if (password == null || password.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
        if (userRepository.findByEmail(email).isPresent())
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));

        if (username == null || username.isBlank())
            username = email.substring(0, email.indexOf("@"));
        if (userRepository.findByUsername(username).isPresent())
            username = username + "_" + System.currentTimeMillis() % 10000;

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("ADMIN".equalsIgnoreCase(role) ? "ADMIN" : "USER");
        user.setEmailVerified(true);
        userRepository.save(user);

        return ResponseEntity.ok(new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole()));
    }

    /** Admin: update a user's role */
    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (!"ADMIN".equals(newRole) && !"USER".equals(newRole))
            return ResponseEntity.badRequest().body(Map.of("message", "Role must be ADMIN or USER"));

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        userRepository.save(user);
        return ResponseEntity.ok(new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole()));
    }

    /** Admin: reset a user's password */
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("password");
        if (newPassword == null || newPassword.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    /** Admin: delete a user */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User caller = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (caller.getId().equals(id))
            return ResponseEntity.badRequest().body(Map.of("message", "You cannot delete your own account"));

        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent deleting the last admin
        if ("ADMIN".equals(target.getRole())) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> "ADMIN".equals(u.getRole())).count();
            if (adminCount <= 1)
                return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete the last admin account"));
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    /** Current user: get own profile */
    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), user.getCreatedAt()));
    }

    /** Current user: update own profile (username only) */
    @PutMapping("/me")
    public ResponseEntity<?> updateMe(Authentication authentication, @RequestBody Map<String, String> body) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newUsername = body.get("username");
        if (newUsername == null || newUsername.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Username cannot be empty"));
        newUsername = newUsername.trim();
        if (!newUsername.equals(user.getUsername()) && userRepository.findByUsername(newUsername).isPresent())
            return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));

        user.setUsername(newUsername);
        userRepository.save(user);
        return ResponseEntity.ok(new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole(), user.getCreatedAt()));
    }

    /** Current user: change own password */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String currentPassword = body.get("currentPassword");
        String newPassword     = body.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));
        if (newPassword == null || newPassword.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
