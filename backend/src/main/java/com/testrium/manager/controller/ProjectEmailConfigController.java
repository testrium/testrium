package com.testrium.manager.controller;

import com.testrium.manager.entity.ProjectEmailConfig;
import com.testrium.manager.service.EmailService;
import com.testrium.manager.service.ProjectEmailConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/email-config")
@CrossOrigin(origins = "*")
public class ProjectEmailConfigController {

    @Autowired
    private ProjectEmailConfigService service;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public ResponseEntity<?> getConfig(@PathVariable Long projectId) {
        return ResponseEntity.ok(service.getConfig(projectId));
    }

    @PutMapping
    public ResponseEntity<?> saveConfig(@PathVariable Long projectId,
                                        @RequestBody Map<String, String> body) {
        Boolean enabled = body.get("enabled") != null ? Boolean.parseBoolean(body.get("enabled")) : true;
        service.saveConfig(
                projectId,
                body.get("smtpHost"),
                body.get("smtpPort"),
                body.get("smtpUsername"),
                body.get("password"),
                body.get("fromAddress"),
                body.get("tls"),
                enabled
        );
        return ResponseEntity.ok(Map.of("message", "Email configuration saved"));
    }

    @PostMapping("/test")
    public ResponseEntity<?> testEmail(@PathVariable Long projectId,
                                       @RequestBody Map<String, String> body) {
        String toEmail = body.get("email");
        if (toEmail == null || toEmail.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email address required"));
        try {
            emailService.sendTestEmailForProject(projectId, toEmail);
            return ResponseEntity.ok(Map.of("message", "Test email sent to " + toEmail));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
