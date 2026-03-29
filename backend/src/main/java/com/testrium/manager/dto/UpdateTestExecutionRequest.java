package com.testrium.manager.dto;

public class UpdateTestExecutionRequest {
    private String status;
    private String actualResult;
    private String comments;
    private Integer executionTimeMinutes;
    private String defectReference;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getActualResult() {
        return actualResult;
    }

    public void setActualResult(String actualResult) {
        this.actualResult = actualResult;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Integer getExecutionTimeMinutes() {
        return executionTimeMinutes;
    }

    public void setExecutionTimeMinutes(Integer executionTimeMinutes) {
        this.executionTimeMinutes = executionTimeMinutes;
    }

    public String getDefectReference() {
        return defectReference;
    }

    public void setDefectReference(String defectReference) {
        this.defectReference = defectReference;
    }
}
