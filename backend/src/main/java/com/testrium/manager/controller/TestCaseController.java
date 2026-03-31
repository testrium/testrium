package com.testrium.manager.controller;

import com.testrium.manager.dto.BulkImportResult;
import com.testrium.manager.dto.TestCaseDTO;
import com.testrium.manager.entity.TestCase;
import com.testrium.manager.service.TestCaseBulkImportService;
import com.testrium.manager.service.TestCaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/test-cases")
@CrossOrigin(origins = "*")
public class TestCaseController {

    private final TestCaseService testCaseService;
    private final TestCaseBulkImportService bulkImportService;

    public TestCaseController(TestCaseService testCaseService, TestCaseBulkImportService bulkImportService) {
        this.testCaseService = testCaseService;
        this.bulkImportService = bulkImportService;
    }

    @GetMapping
    public ResponseEntity<List<TestCaseDTO>> getAllTestCases(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long moduleId,
            @RequestParam(required = false) TestCase.TestCaseStatus status,
            @RequestParam(required = false) TestCase.Priority priority,
            @RequestParam(required = false) String tag) {

        if (projectId != null && (moduleId != null || status != null || priority != null || tag != null)) {
            return ResponseEntity.ok(testCaseService.getTestCasesByFilters(projectId, moduleId, status, priority, tag));
        } else if (projectId != null) {
            return ResponseEntity.ok(testCaseService.getTestCasesByProject(projectId));
        } else if (moduleId != null) {
            return ResponseEntity.ok(testCaseService.getTestCasesByModule(moduleId));
        } else {
            return ResponseEntity.ok(testCaseService.getAllTestCases());
        }
    }

    @GetMapping("/tags")
    public ResponseEntity<List<String>> getTagsByProject(@RequestParam Long projectId) {
        return ResponseEntity.ok(testCaseService.getTagsByProject(projectId));
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

    /**
     * Bulk import test cases from Excel or CSV file
     * @param file Excel (.xlsx, .xls) or CSV (.csv) file
     * @param projectId Target project ID
     * @param applicationId Target application ID
     * @return Import result with success/failure details
     */
    @PostMapping("/bulk/import")
    public ResponseEntity<BulkImportResult> bulkImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") Long projectId,
            @RequestParam("applicationId") Long applicationId) {
        try {
            BulkImportResult result = bulkImportService.importFromFile(file, projectId, applicationId);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            BulkImportResult errorResult = new BulkImportResult();
            errorResult.setMessage("Error reading file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResult);
        } catch (Exception e) {
            BulkImportResult errorResult = new BulkImportResult();
            errorResult.setMessage("Error processing import: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);
        }
    }

    /**
     * Download Excel template for bulk import
     * @return Excel file with headers and sample data
     */
    @GetMapping("/bulk/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            byte[] template = bulkImportService.generateTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "TestCase_Import_Template.xlsx");
            headers.setContentLength(template.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(template);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
