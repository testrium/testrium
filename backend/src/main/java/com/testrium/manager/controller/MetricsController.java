package com.testrium.manager.controller;

import com.testrium.manager.dto.CrossProjectOverviewDTO;
import com.testrium.manager.dto.TestCaseMetricsDTO;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.UserRepository;
import com.testrium.manager.service.CrossProjectOverviewService;
import com.testrium.manager.service.TestCaseMetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricsController {

    private final TestCaseMetricsService metricsService;

    @Autowired
    private CrossProjectOverviewService overviewService;

    @Autowired
    private UserRepository userRepository;

    public MetricsController(TestCaseMetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<CrossProjectOverviewDTO> getOverview(Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(overviewService.getOverview(currentUser));
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<TestCaseMetricsDTO> getModuleMetrics(@PathVariable Long moduleId) {
        return ResponseEntity.ok(metricsService.getModuleMetrics(moduleId));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<TestCaseMetricsDTO> getApplicationMetrics(@PathVariable Long applicationId) {
        return ResponseEntity.ok(metricsService.getApplicationMetrics(applicationId));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<TestCaseMetricsDTO> getProjectMetrics(@PathVariable Long projectId) {
        return ResponseEntity.ok(metricsService.getProjectMetrics(projectId));
    }

    @GetMapping("/project/{projectId}/applications")
    public ResponseEntity<List<TestCaseMetricsDTO>> getAllApplicationMetricsForProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(metricsService.getAllApplicationMetricsForProject(projectId));
    }

    @GetMapping("/application/{applicationId}/modules")
    public ResponseEntity<List<TestCaseMetricsDTO>> getAllModuleMetricsForApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(metricsService.getAllModuleMetricsForApplication(applicationId));
    }
}
