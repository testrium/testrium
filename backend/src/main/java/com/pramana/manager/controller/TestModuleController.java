package com.pramana.manager.controller;

import com.pramana.manager.dto.TestModuleDTO;
import com.pramana.manager.service.TestModuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-modules")
@CrossOrigin(origins = "*")
public class TestModuleController {

    private final TestModuleService testModuleService;

    public TestModuleController(TestModuleService testModuleService) {
        this.testModuleService = testModuleService;
    }

    @GetMapping
    public ResponseEntity<List<TestModuleDTO>> getAllModules(@RequestParam(required = false) Long projectId) {
        if (projectId != null) {
            return ResponseEntity.ok(testModuleService.getModulesByProject(projectId));
        } else {
            return ResponseEntity.ok(testModuleService.getAllModules());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestModuleDTO> getModuleById(@PathVariable Long id) {
        return ResponseEntity.ok(testModuleService.getModuleById(id));
    }

    @PostMapping
    public ResponseEntity<TestModuleDTO> createModule(@Valid @RequestBody TestModuleDTO dto) {
        TestModuleDTO created = testModuleService.createModule(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestModuleDTO> updateModule(@PathVariable Long id, @Valid @RequestBody TestModuleDTO dto) {
        TestModuleDTO updated = testModuleService.updateModule(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModule(@PathVariable Long id) {
        testModuleService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }
}
