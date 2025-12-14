package com.pramana.manager.controller;

import com.pramana.manager.dto.JiraConfigurationDTO;
import com.pramana.manager.dto.JiraIssueDTO;
import com.pramana.manager.entity.User;
import com.pramana.manager.repository.UserRepository;
import com.pramana.manager.service.JiraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/jira")
@CrossOrigin(origins = "*")
public class JiraController {

    @Autowired
    private JiraService jiraService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/config")
    public ResponseEntity<?> saveConfiguration(
            @RequestBody JiraConfigurationDTO dto,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            JiraConfigurationDTO saved = jiraService.saveConfiguration(dto, currentUser.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/config/project/{projectId}")
    public ResponseEntity<?> getConfigurationByProject(@PathVariable Long projectId) {
        try {
            Optional<JiraConfigurationDTO> config = jiraService.getConfigurationByProjectId(projectId);
            if (config.isPresent()) {
                return ResponseEntity.ok(config.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "JIRA configuration not found for this project"));
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/config/{configId}")
    public ResponseEntity<?> deleteConfiguration(@PathVariable Long configId) {
        try {
            jiraService.deleteConfiguration(configId);
            return ResponseEntity.ok(Map.of("message", "JIRA configuration deleted successfully"));
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/issue")
    public ResponseEntity<?> createIssue(
            @RequestBody JiraIssueDTO issueDTO,
            @RequestParam Long projectId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            JiraIssueDTO result = jiraService.createJiraIssue(issueDTO, projectId, email);

            if ("Created".equals(result.getStatus())) {
                return ResponseEntity.status(HttpStatus.CREATED).body(result);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }
        } catch (Exception e) {
            JiraIssueDTO errorResult = new JiraIssueDTO();
            errorResult.setStatus("Failed");
            errorResult.setErrorMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResult);
        }
    }
}
