package com.pramana.manager.service;

import com.pramana.manager.dto.BulkImportResult;
import com.pramana.manager.dto.TestCaseImportRow;
import com.pramana.manager.entity.*;
import com.pramana.manager.entity.TestCase.Priority;
import com.pramana.manager.entity.TestCase.TestCaseStatus;
import com.pramana.manager.entity.TestCase.TestType;
import com.pramana.manager.exception.ResourceNotFoundException;
import com.pramana.manager.repository.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class TestCaseBulkImportService {

    private final TestCaseRepository testCaseRepository;
    private final ProjectRepository projectRepository;
    private final ApplicationRepository applicationRepository;
    private final TestModuleRepository testModuleRepository;
    private final UserRepository userRepository;

    public TestCaseBulkImportService(
            TestCaseRepository testCaseRepository,
            ProjectRepository projectRepository,
            ApplicationRepository applicationRepository,
            TestModuleRepository testModuleRepository,
            UserRepository userRepository) {
        this.testCaseRepository = testCaseRepository;
        this.projectRepository = projectRepository;
        this.applicationRepository = applicationRepository;
        this.testModuleRepository = testModuleRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BulkImportResult importFromFile(MultipartFile file, Long projectId, Long applicationId) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException("File name is required");
        }

        if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            return importFromExcel(file, projectId, applicationId);
        } else if (filename.endsWith(".csv")) {
            return importFromCSV(file, projectId, applicationId);
        } else {
            throw new IllegalArgumentException("Unsupported file format. Please upload .xlsx, .xls, or .csv file");
        }
    }

    private BulkImportResult importFromExcel(MultipartFile file, Long projectId, Long applicationId) throws IOException {
        BulkImportResult result = new BulkImportResult();
        List<TestCaseImportRow> rows = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // Read header row to get column indices
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                result.setMessage("Excel file is empty");
                return result;
            }

            Map<String, Integer> columnMap = buildColumnMap(headerRow);

            // Read data rows
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                TestCaseImportRow importRow = parseExcelRow(row, columnMap, i + 1);
                if (importRow != null) {
                    rows.add(importRow);
                }
            }
        }

        result.setTotalRows(rows.size());
        return processImportRows(rows, projectId, applicationId, result);
    }

    private BulkImportResult importFromCSV(MultipartFile file, Long projectId, Long applicationId) throws IOException {
        BulkImportResult result = new BulkImportResult();
        List<TestCaseImportRow> rows = new ArrayList<>();

        try (CSVParser parser = CSVFormat.DEFAULT
                .withFirstRecordAsHeader()
                .withIgnoreHeaderCase()
                .withTrim()
                .parse(new InputStreamReader(file.getInputStream()))) {

            int rowNumber = 2; // Start from 2 (1 is header)
            for (CSVRecord record : parser) {
                TestCaseImportRow importRow = parseCSVRow(record, rowNumber);
                if (importRow != null) {
                    rows.add(importRow);
                }
                rowNumber++;
            }
        }

        result.setTotalRows(rows.size());
        return processImportRows(rows, projectId, applicationId, result);
    }

    private Map<String, Integer> buildColumnMap(Row headerRow) {
        Map<String, Integer> columnMap = new HashMap<>();

        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell != null) {
                String headerName = cell.getStringCellValue().trim().toLowerCase();
                columnMap.put(headerName, i);
            }
        }

        return columnMap;
    }

    private TestCaseImportRow parseExcelRow(Row row, Map<String, Integer> columnMap, int rowNumber) {
        TestCaseImportRow importRow = new TestCaseImportRow();

        importRow.setId(getCellValue(row, columnMap.get("id")));
        importRow.setTitle(getCellValue(row, columnMap.get("title")));
        importRow.setAutomationType(getCellValue(row, columnMap.get("automation type")));
        importRow.setCreatedBy(getCellValue(row, columnMap.get("created by")));
        importRow.setSection(getCellValue(row, columnMap.get("section")));
        importRow.setSteps(getCellValue(row, columnMap.get("steps")));
        importRow.setDescription(getCellValue(row, columnMap.get("description")));
        importRow.setPreconditions(getCellValue(row, columnMap.get("preconditions")));
        importRow.setExpectedResult(getCellValue(row, columnMap.get("expected result")));
        importRow.setPriority(getCellValue(row, columnMap.get("priority")));
        importRow.setType(getCellValue(row, columnMap.get("type")));
        importRow.setIsAutomated(getCellValue(row, columnMap.get("is automated")));
        importRow.setIsRegression(getCellValue(row, columnMap.get("is regression")));

        return importRow;
    }

    private TestCaseImportRow parseCSVRow(CSVRecord record, int rowNumber) {
        TestCaseImportRow importRow = new TestCaseImportRow();

        importRow.setId(getCSVValue(record, "ID"));
        importRow.setTitle(getCSVValue(record, "Title"));
        importRow.setAutomationType(getCSVValue(record, "Automation Type"));
        importRow.setCreatedBy(getCSVValue(record, "Created By"));
        importRow.setSection(getCSVValue(record, "Section"));
        importRow.setSteps(getCSVValue(record, "Steps"));
        importRow.setDescription(getCSVValue(record, "Description"));
        importRow.setPreconditions(getCSVValue(record, "Preconditions"));
        importRow.setExpectedResult(getCSVValue(record, "Expected Result"));
        importRow.setPriority(getCSVValue(record, "Priority"));
        importRow.setType(getCSVValue(record, "Type"));
        importRow.setIsAutomated(getCSVValue(record, "Is Automated"));
        importRow.setIsRegression(getCSVValue(record, "Is Regression"));

        return importRow;
    }

    private String getCellValue(Row row, Integer columnIndex) {
        if (columnIndex == null) return null;

        Cell cell = row.getCell(columnIndex);
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }

    private String getCSVValue(CSVRecord record, String columnName) {
        try {
            String value = record.get(columnName);
            return (value == null || value.trim().isEmpty()) ? null : value.trim();
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @Transactional
    private BulkImportResult processImportRows(List<TestCaseImportRow> rows, Long projectId, Long applicationId, BulkImportResult result) {
        User currentUser = getCurrentUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        // Cache for created modules
        Map<String, TestModule> moduleCache = new HashMap<>();

        // Get existing test cases to check for duplicates
        List<TestCase> existingTestCases = testCaseRepository.findByProjectId(projectId);
        Set<String> existingTitles = new HashSet<>();
        for (TestCase tc : existingTestCases) {
            existingTitles.add(tc.getTitle().trim().toLowerCase());
        }

        int rowNumber = 2; // Starting from row 2 (header is row 1)
        for (TestCaseImportRow row : rows) {
            try {
                // Validate required fields
                if (row.getTitle() == null || row.getTitle().trim().isEmpty()) {
                    result.addError(rowNumber, row.getTitle(), "Title is required", "title");
                    result.incrementFailure();
                    rowNumber++;
                    continue;
                }

                // Check for duplicates
                if (existingTitles.contains(row.getTitle().trim().toLowerCase())) {
                    result.addError(rowNumber, row.getTitle(), "Test case with this title already exists (skipped)", "title");
                    result.incrementSkipped();
                    rowNumber++;
                    continue;
                }

                // Create or get module
                TestModule module = null;
                if (row.getSection() != null && !row.getSection().trim().isEmpty()) {
                    String moduleName = row.getSection().trim();

                    if (moduleCache.containsKey(moduleName)) {
                        module = moduleCache.get(moduleName);
                    } else {
                        // Check if module exists
                        module = findModuleByName(moduleName, projectId, applicationId);
                        if (module == null) {
                            // Create new module
                            module = createModule(moduleName, project, application, currentUser);
                            result.getCreatedModules().add(moduleName);
                        }
                        moduleCache.put(moduleName, module);
                    }
                }

                // Create test case
                TestCase testCase = new TestCase();
                testCase.setTitle(row.getTitle().trim());
                testCase.setDescription(row.getDescription());
                testCase.setPreconditions(row.getPreconditions());

                // Steps - required field
                if (row.getSteps() == null || row.getSteps().trim().isEmpty()) {
                    testCase.setSteps("N/A"); // Default value if not provided
                } else {
                    testCase.setSteps(row.getSteps());
                }

                // Expected Result - required field
                if (row.getExpectedResult() == null || row.getExpectedResult().trim().isEmpty()) {
                    testCase.setExpectedResult("N/A"); // Default value if not provided
                } else {
                    testCase.setExpectedResult(row.getExpectedResult());
                }

                // Priority
                testCase.setPriority(parsePriority(row.getPriority()));

                // Type
                testCase.setType(parseType(row.getType(), row.getAutomationType()));

                // Status
                testCase.setStatus(TestCaseStatus.ACTIVE);

                // Automation flags
                testCase.setIsAutomated(parseBoolean(row.getIsAutomated(), row.getAutomationType()));
                testCase.setIsRegression(parseBoolean(row.getIsRegression(), null));

                // Relationships
                testCase.setProject(project);
                testCase.setModule(module);
                testCase.setCreatedBy(currentUser);
                testCase.setCreatedAt(LocalDateTime.now());

                // Save
                testCaseRepository.save(testCase);
                existingTitles.add(testCase.getTitle().trim().toLowerCase());
                result.incrementSuccess();

            } catch (Exception e) {
                result.addError(rowNumber, row.getTitle(), e.getMessage(), "general");
                result.incrementFailure();
            }

            rowNumber++;
        }

        // Set summary message
        StringBuilder message = new StringBuilder();
        message.append(String.format("Import completed: %d successful, %d skipped, %d failed",
                result.getSuccessCount(), result.getSkippedCount(), result.getFailureCount()));
        if (!result.getCreatedModules().isEmpty()) {
            message.append(String.format(". Created %d new modules.", result.getCreatedModules().size()));
        }
        result.setMessage(message.toString());

        return result;
    }

    private TestModule findModuleByName(String moduleName, Long projectId, Long applicationId) {
        List<TestModule> modules = testModuleRepository.findByProjectId(projectId);
        return modules.stream()
                .filter(m -> m.getName().equalsIgnoreCase(moduleName) &&
                            m.getApplication() != null &&
                            m.getApplication().getId().equals(applicationId))
                .findFirst()
                .orElse(null);
    }

    private TestModule createModule(String moduleName, Project project, Application application, User currentUser) {
        TestModule module = new TestModule();
        module.setName(moduleName);
        module.setProject(project);
        module.setApplication(application);
        module.setCreatedBy(currentUser);
        module.setCreatedAt(LocalDateTime.now());
        return testModuleRepository.save(module);
    }

    private Priority parsePriority(String priority) {
        if (priority == null || priority.trim().isEmpty()) {
            return Priority.MEDIUM; // Default
        }

        try {
            return Priority.valueOf(priority.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            // Try to map common variations
            String normalized = priority.trim().toUpperCase();
            if (normalized.contains("HIGH") || normalized.contains("P1")) {
                return Priority.HIGH;
            } else if (normalized.contains("CRITICAL") || normalized.contains("P0")) {
                return Priority.CRITICAL;
            } else if (normalized.contains("LOW") || normalized.contains("P3")) {
                return Priority.LOW;
            } else {
                return Priority.MEDIUM;
            }
        }
    }

    private TestType parseType(String type, String automationType) {
        // First try the type field
        if (type != null && !type.trim().isEmpty()) {
            try {
                return TestType.valueOf(type.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Fall through to automation type
            }
        }

        // Try automation type field
        if (automationType != null && !automationType.trim().isEmpty()) {
            String normalized = automationType.trim().toUpperCase();
            if (normalized.contains("API")) {
                return TestType.API;
            } else if (normalized.contains("UI")) {
                return TestType.UI;
            } else if (normalized.contains("FUNCTIONAL")) {
                return TestType.FUNCTIONAL;
            } else if (normalized.contains("INTEGRATION")) {
                return TestType.INTEGRATION;
            }
        }

        return TestType.FUNCTIONAL; // Default
    }

    private boolean parseBoolean(String value, String fallbackValue) {
        if (value != null && !value.trim().isEmpty()) {
            String normalized = value.trim().toLowerCase();
            return normalized.equals("true") ||
                   normalized.equals("yes") ||
                   normalized.equals("1") ||
                   normalized.equals("automated");
        }

        if (fallbackValue != null && !fallbackValue.trim().isEmpty()) {
            String normalized = fallbackValue.trim().toLowerCase();
            return normalized.contains("automated") ||
                   normalized.contains("auto");
        }

        return false;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public byte[] generateTemplate() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Test Cases");

        // Create header style
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {
            "ID", "Title", "Automation Type", "Created By", "Section",
            "Steps", "Description", "Preconditions", "Expected Result",
            "Priority", "Type", "Is Automated", "Is Regression"
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
            sheet.setColumnWidth(i, 5000);
        }

        // Create sample row
        Row sampleRow = sheet.createRow(1);
        String[] sampleData = {
            "TC001",
            "Sample Test Case",
            "Automated",
            "John Doe",
            "Login Module",
            "1. Open application\n2. Enter credentials\n3. Click login",
            "Verify user can login successfully",
            "User account exists",
            "User is logged in and redirected to dashboard",
            "HIGH",
            "FUNCTIONAL",
            "true",
            "true"
        };

        for (int i = 0; i < sampleData.length; i++) {
            sampleRow.createCell(i).setCellValue(sampleData[i]);
        }

        // Write to byte array
        java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }
}
