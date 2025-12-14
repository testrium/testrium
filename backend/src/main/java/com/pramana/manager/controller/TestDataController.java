package com.pramana.manager.controller;

import com.pramana.manager.dto.TestDataDTO;
import com.pramana.manager.service.TestDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-data")
public class TestDataController {

    @Autowired
    private TestDataService testDataService;

    @PostMapping
    public ResponseEntity<TestDataDTO> createTestData(
            @RequestBody TestDataDTO testDataDTO,
            Authentication authentication) {
        String email = authentication.getName();
        TestDataDTO created = testDataService.createTestData(testDataDTO, email);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestDataDTO> updateTestData(
            @PathVariable Long id,
            @RequestBody TestDataDTO testDataDTO) {
        TestDataDTO updated = testDataService.updateTestData(id, testDataDTO);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestDataDTO> getTestDataById(@PathVariable Long id) {
        TestDataDTO testData = testDataService.getTestDataById(id);
        return ResponseEntity.ok(testData);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TestDataDTO>> getTestDataByProject(@PathVariable Long projectId) {
        List<TestDataDTO> testDataList = testDataService.getTestDataByProject(projectId);
        return ResponseEntity.ok(testDataList);
    }

    @GetMapping("/project/{projectId}/environment/{environment}")
    public ResponseEntity<List<TestDataDTO>> getTestDataByProjectAndEnvironment(
            @PathVariable Long projectId,
            @PathVariable String environment) {
        List<TestDataDTO> testDataList = testDataService.getTestDataByProjectAndEnvironment(projectId, environment);
        return ResponseEntity.ok(testDataList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestData(@PathVariable Long id) {
        testDataService.deleteTestData(id);
        return ResponseEntity.ok().build();
    }
}
