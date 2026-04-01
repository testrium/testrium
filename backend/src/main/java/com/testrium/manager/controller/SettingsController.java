package com.testrium.manager.controller;

import com.testrium.manager.entity.User;
import com.testrium.manager.repository.UserRepository;
import com.testrium.manager.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @Autowired
    private UserRepository userRepository;

    private boolean isAdmin(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        return user != null && "ADMIN".equals(user.getRole());
    }

    @GetMapping("/email")
    public ResponseEntity<?> getEmailSettings(Authentication auth) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        return ResponseEntity.ok(settingsService.getEmailSettings());
    }

    @PutMapping("/email")
    public ResponseEntity<?> saveEmailSettings(Authentication auth,
                                               @RequestBody Map<String, String> body) {
        if (!isAdmin(auth)) return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        settingsService.saveEmailSettings(
                body.get("host"),
                body.get("port"),
                body.get("username"),
                body.get("password"),
                body.get("from"),
                body.get("tls")
        );
        return ResponseEntity.ok(Map.of("message", "Email settings saved"));
    }
}
