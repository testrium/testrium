package com.testrium.manager.controller;

import com.testrium.manager.dto.TestCaseMetricsDTO;
import com.testrium.manager.service.TestCaseMetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricsController {

    private final TestCaseMetricsService metricsService;

    public MetricsController(TestCaseMetricsService metricsService) {
        this.metricsService = metricsService;
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
