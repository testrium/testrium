package com.pramana.manager.controller;

import com.pramana.manager.dto.*;
import com.pramana.manager.entity.User;
import com.pramana.manager.repository.UserRepository;
import com.pramana.manager.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/overall")
    public ResponseEntity<?> getOverallStats(Authentication authentication) {
        try {
            String email = authentication.getName();
            OverallStatsDTO stats = reportService.getOverallStats(email);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getProjectStats(@PathVariable Long projectId) {
        try {
            ProjectStatsDTO stats = reportService.getProjectStats(projectId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/test-run/{testRunId}")
    public ResponseEntity<?> getTestRunReport(@PathVariable Long testRunId) {
        try {
            TestRunReportDTO report = reportService.getTestRunReport(testRunId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/trend/{projectId}")
    public ResponseEntity<?> getTrendAnalysis(
            @PathVariable Long projectId,
            @RequestParam(required = false) Integer limit) {
        try {
            List<TrendDataDTO> trendData = reportService.getTrendAnalysis(projectId, limit);
            return ResponseEntity.ok(trendData);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/templates")
    public ResponseEntity<?> createTemplate(
            @RequestBody ReportTemplateDTO dto,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            ReportTemplateDTO created = reportService.createTemplate(dto, currentUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/templates")
    public ResponseEntity<?> getUserTemplates(Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            List<ReportTemplateDTO> templates = reportService.getUserTemplates(currentUser.getId());
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/templates/{id}")
    public ResponseEntity<?> getTemplateById(@PathVariable Long id) {
        try {
            ReportTemplateDTO template = reportService.getTemplateById(id);
            return ResponseEntity.ok(template);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        try {
            reportService.deleteTemplate(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Template deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
}
