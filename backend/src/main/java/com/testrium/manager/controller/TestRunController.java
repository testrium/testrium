package com.testrium.manager.controller;

import com.testrium.manager.dto.CreateTestRunRequest;
import com.testrium.manager.dto.TestRunDTO;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.UserRepository;
import com.testrium.manager.service.TestRunService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test-runs")
@CrossOrigin(origins = "*")
public class TestRunController {

    @Autowired
    private TestRunService testRunService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createTestRun(
            @RequestBody CreateTestRunRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            TestRunDTO testRun = testRunService.createTestRun(request, currentUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(testRun);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllTestRuns(@RequestParam(required = false) Long projectId) {
        try {
            List<TestRunDTO> testRuns;
            if (projectId != null) {
                testRuns = testRunService.getTestRunsByProject(projectId);
            } else {
                testRuns = testRunService.getAllTestRuns();
            }
            return ResponseEntity.ok(testRuns);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTestRunById(@PathVariable Long id) {
        try {
            TestRunDTO testRun = testRunService.getTestRunById(id);
            return ResponseEntity.ok(testRun);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateTestRunStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String status = statusUpdate.get("status");
            if (status == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Status is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            TestRunDTO testRun = testRunService.updateTestRunStatus(id, status);
            return ResponseEntity.ok(testRun);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestRun(@PathVariable Long id) {
        try {
            testRunService.deleteTestRun(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Test run deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
}
