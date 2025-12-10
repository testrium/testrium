package com.pramana.manager.controller;

import com.pramana.manager.dto.OverallStatsDTO;
import com.pramana.manager.dto.ProjectStatsDTO;
import com.pramana.manager.dto.TestRunReportDTO;
import com.pramana.manager.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

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
}
