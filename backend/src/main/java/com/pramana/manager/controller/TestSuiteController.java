package com.pramana.manager.controller;

import com.pramana.manager.dto.TestSuiteDTO;
import com.pramana.manager.service.TestSuiteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-suites")
@CrossOrigin(origins = "*")
public class TestSuiteController {

    private final TestSuiteService testSuiteService;

    public TestSuiteController(TestSuiteService testSuiteService) {
        this.testSuiteService = testSuiteService;
    }

    @GetMapping
    public ResponseEntity<List<TestSuiteDTO>> getAllSuites(@RequestParam(required = false) Long projectId) {
        if (projectId != null) {
            return ResponseEntity.ok(testSuiteService.getSuitesByProject(projectId));
        } else {
            return ResponseEntity.ok(testSuiteService.getAllSuites());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestSuiteDTO> getSuiteById(@PathVariable Long id) {
        return ResponseEntity.ok(testSuiteService.getSuiteById(id));
    }

    @PostMapping
    public ResponseEntity<TestSuiteDTO> createSuite(@Valid @RequestBody TestSuiteDTO dto) {
        TestSuiteDTO created = testSuiteService.createSuite(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestSuiteDTO> updateSuite(@PathVariable Long id, @Valid @RequestBody TestSuiteDTO dto) {
        TestSuiteDTO updated = testSuiteService.updateSuite(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSuite(@PathVariable Long id) {
        testSuiteService.deleteSuite(id);
        return ResponseEntity.noContent().build();
    }
}
