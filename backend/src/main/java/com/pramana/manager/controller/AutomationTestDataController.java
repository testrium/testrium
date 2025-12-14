package com.pramana.manager.controller;

import com.pramana.manager.dto.TestDataDTO;
import com.pramana.manager.service.TestDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST API Controller for Automation Test Frameworks
 * Provides endpoints to fetch and manage test data during automated test execution
 */
@RestController
@RequestMapping("/api/automation/test-data")
public class AutomationTestDataController {

    @Autowired
    private TestDataService testDataService;

    /**
     * Get test data by project and environment
     * Example: GET /api/automation/test-data?projectId=1&environment=QA
     */
    @GetMapping
    public ResponseEntity<List<TestDataDTO>> getTestData(
            @RequestParam Long projectId,
            @RequestParam(required = false) String environment) {

        List<TestDataDTO> testDataList = environment != null
            ? testDataService.getTestDataByProjectAndEnvironment(projectId, environment)
            : testDataService.getTestDataByProject(projectId);

        return ResponseEntity.ok(testDataList);
    }

    /**
     * Get specific test data by ID and return parsed content
     * Example: GET /api/automation/test-data/1/content
     */
    @GetMapping("/{id}/content")
    public ResponseEntity<Map<String, Object>> getTestDataContent(@PathVariable Long id) {
        TestDataDTO testData = testDataService.getTestDataById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("id", testData.getId());
        response.put("name", testData.getName());
        response.put("environment", testData.getEnvironment());
        response.put("dataType", testData.getDataType());
        response.put("data", testData.getDataContent()); // Return raw JSON string

        return ResponseEntity.ok(response);
    }

    /**
     * Get test data by name (useful for automation scripts)
     * Example: GET /api/automation/test-data/by-name?projectId=1&name=LoginCredentials&environment=QA
     */
    @GetMapping("/by-name")
    public ResponseEntity<Map<String, Object>> getTestDataByName(
            @RequestParam Long projectId,
            @RequestParam String name,
            @RequestParam(required = false) String environment) {

        List<TestDataDTO> testDataList = environment != null
            ? testDataService.getTestDataByProjectAndEnvironment(projectId, environment)
            : testDataService.getTestDataByProject(projectId);

        TestDataDTO matchedData = testDataList.stream()
            .filter(td -> td.getName().equalsIgnoreCase(name))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Test data not found: " + name));

        Map<String, Object> response = new HashMap<>();
        response.put("id", matchedData.getId());
        response.put("name", matchedData.getName());
        response.put("description", matchedData.getDescription());
        response.put("environment", matchedData.getEnvironment());
        response.put("dataType", matchedData.getDataType());
        response.put("data", matchedData.getDataContent());

        return ResponseEntity.ok(response);
    }

    /**
     * Create or update test data from automation
     * Example: POST /api/automation/test-data
     */
    @PostMapping
    public ResponseEntity<TestDataDTO> createOrUpdateTestData(
            @RequestBody TestDataDTO testDataDTO,
            Authentication authentication) {

        String email = authentication.getName();

        // Check if test data with same name exists
        List<TestDataDTO> existing = testDataService.getTestDataByProject(testDataDTO.getProjectId());
        TestDataDTO existingData = existing.stream()
            .filter(td -> td.getName().equals(testDataDTO.getName())
                       && td.getEnvironment().equals(testDataDTO.getEnvironment()))
            .findFirst()
            .orElse(null);

        TestDataDTO result;
        if (existingData != null) {
            // Update existing
            result = testDataService.updateTestData(existingData.getId(), testDataDTO);
        } else {
            // Create new
            result = testDataService.createTestData(testDataDTO, email);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Update test data content only (for data-driven tests)
     * Example: PUT /api/automation/test-data/1/content
     */
    @PutMapping("/{id}/content")
    public ResponseEntity<Map<String, String>> updateTestDataContent(
            @PathVariable Long id,
            @RequestBody Map<String, String> contentUpdate) {

        TestDataDTO testData = testDataService.getTestDataById(id);
        testData.setDataContent(contentUpdate.get("dataContent"));
        testDataService.updateTestData(id, testData);

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Test data content updated");

        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "Automation Test Data API");
        return ResponseEntity.ok(response);
    }
}
