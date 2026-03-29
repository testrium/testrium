package com.testrium.manager.dto;

import java.util.ArrayList;
import java.util.List;

public class BulkImportResult {
    private int totalRows;
    private int successCount;
    private int failureCount;
    private int skippedCount;
    private List<ImportError> errors;
    private List<String> createdModules;
    private String message;

    public BulkImportResult() {
        this.errors = new ArrayList<>();
        this.createdModules = new ArrayList<>();
    }

    public static class ImportError {
        private int rowNumber;
        private String testCaseTitle;
        private String error;
        private String field;

        public ImportError() {}

        public ImportError(int rowNumber, String testCaseTitle, String error, String field) {
            this.rowNumber = rowNumber;
            this.testCaseTitle = testCaseTitle;
            this.error = error;
            this.field = field;
        }

        public int getRowNumber() { return rowNumber; }
        public void setRowNumber(int rowNumber) { this.rowNumber = rowNumber; }
        public String getTestCaseTitle() { return testCaseTitle; }
        public void setTestCaseTitle(String testCaseTitle) { this.testCaseTitle = testCaseTitle; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
    }

    public int getTotalRows() { return totalRows; }
    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }
    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }
    public int getFailureCount() { return failureCount; }
    public void setFailureCount(int failureCount) { this.failureCount = failureCount; }
    public int getSkippedCount() { return skippedCount; }
    public void setSkippedCount(int skippedCount) { this.skippedCount = skippedCount; }
    public List<ImportError> getErrors() { return errors; }
    public void setErrors(List<ImportError> errors) { this.errors = errors; }
    public List<String> getCreatedModules() { return createdModules; }
    public void setCreatedModules(List<String> createdModules) { this.createdModules = createdModules; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public void addError(int rowNumber, String testCaseTitle, String error, String field) {
        this.errors.add(new ImportError(rowNumber, testCaseTitle, error, field));
    }

    public void incrementSuccess() {
        this.successCount++;
    }

    public void incrementFailure() {
        this.failureCount++;
    }

    public void incrementSkipped() {
        this.skippedCount++;
    }
}
