package com.pramana.manager.controller;

import com.pramana.manager.dto.TestCaseDTO;
import com.pramana.manager.entity.TestCase;
import com.pramana.manager.service.TestCaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-cases")
@CrossOrigin(origins = "*")
public class TestCaseController {

    private final TestCaseService testCaseService;

    public TestCaseController(TestCaseService testCaseService) {
        this.testCaseService = testCaseService;
    }

    @GetMapping
    public ResponseEntity<List<TestCaseDTO>> getAllTestCases(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long suiteId,
            @RequestParam(required = false) TestCase.TestCaseStatus status,
            @RequestParam(required = false) TestCase.Priority priority) {

        if (projectId != null && (suiteId != null || status != null || priority != null)) {
            return ResponseEntity.ok(testCaseService.getTestCasesByFilters(projectId, suiteId, status, priority));
        } else if (projectId != null) {
            return ResponseEntity.ok(testCaseService.getTestCasesByProject(projectId));
        } else if (suiteId != null) {
            return ResponseEntity.ok(testCaseService.getTestCasesBySuite(suiteId));
        } else {
            return ResponseEntity.ok(testCaseService.getAllTestCases());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestCaseDTO> getTestCaseById(@PathVariable Long id) {
        return ResponseEntity.ok(testCaseService.getTestCaseById(id));
    }

    @PostMapping
    public ResponseEntity<TestCaseDTO> createTestCase(@Valid @RequestBody TestCaseDTO dto) {
        TestCaseDTO created = testCaseService.createTestCase(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestCaseDTO> updateTestCase(@PathVariable Long id, @Valid @RequestBody TestCaseDTO dto) {
        TestCaseDTO updated = testCaseService.updateTestCase(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestCase(@PathVariable Long id) {
        testCaseService.deleteTestCase(id);
        return ResponseEntity.noContent().build();
    }
}
