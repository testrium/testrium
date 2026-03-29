package com.testrium.manager.controller;

import com.testrium.manager.entity.Application;
import com.testrium.manager.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Application>> getActiveApplications() {
        return ResponseEntity.ok(applicationService.getActiveApplications());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Application>> getApplicationsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(applicationService.getApplicationsByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @PostMapping
    public ResponseEntity<Application> createApplication(
            @RequestBody Application application,
            Authentication authentication) {
        String userEmail = authentication.getName();
        Application created = applicationService.createApplication(application, userEmail);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Application> updateApplication(
            @PathVariable Long id,
            @RequestBody Application application) {
        Application updated = applicationService.updateApplication(id, application);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
