package com.pramana.manager.controller;

import com.pramana.manager.dto.TestExecutionDTO;
import com.pramana.manager.dto.UpdateTestExecutionRequest;
import com.pramana.manager.entity.User;
import com.pramana.manager.repository.UserRepository;
import com.pramana.manager.service.TestExecutionService;
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
}
