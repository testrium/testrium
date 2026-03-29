package com.testrium.manager.controller;

import com.testrium.manager.dto.TestExecutionDTO;
import com.testrium.manager.dto.UpdateTestExecutionRequest;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.UserRepository;
import com.testrium.manager.service.TestExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test-executions")
@CrossOrigin(origins = "*")
public class TestExecutionController {

    @Autowired
    private TestExecutionService testExecutionService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getExecutionsByTestRun(@RequestParam Long testRunId) {
        try {
            List<TestExecutionDTO> executions = testExecutionService.getExecutionsByTestRun(testRunId);
            return ResponseEntity.ok(executions);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExecutionById(@PathVariable Long id) {
        try {
            TestExecutionDTO execution = testExecutionService.getExecutionById(id);
            return ResponseEntity.ok(execution);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExecution(
            @PathVariable Long id,
            @RequestBody UpdateTestExecutionRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            TestExecutionDTO execution = testExecutionService.updateExecution(id, request, currentUser.getId());
            return ResponseEntity.ok(execution);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/bulk-update")
    public ResponseEntity<?> bulkUpdateExecutions(
            @RequestBody BulkUpdateRequest bulkRequest,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<TestExecutionDTO> executions = testExecutionService.bulkUpdateExecutions(
                    bulkRequest.getExecutionIds(),
                    bulkRequest.getUpdateRequest(),
                    currentUser.getId()
            );
            return ResponseEntity.ok(executions);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // Inner class for bulk update request
    public static class BulkUpdateRequest {
        private List<Long> executionIds;
        private UpdateTestExecutionRequest updateRequest;

        public List<Long> getExecutionIds() {
            return executionIds;
        }

        public void setExecutionIds(List<Long> executionIds) {
            this.executionIds = executionIds;
        }

        public UpdateTestExecutionRequest getUpdateRequest() {
            return updateRequest;
        }

        public void setUpdateRequest(UpdateTestExecutionRequest updateRequest) {
            this.updateRequest = updateRequest;
        }
    }
}
