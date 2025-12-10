package com.pramana.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStatsDTO {
    private Long projectId;
    private String projectName;
    private Long totalTestCases;
    private Long totalTestRuns;
    private Long totalExecutions;
    private Long passedExecutions;
    private Long failedExecutions;
    private Long skippedExecutions;
    private Double passRate;
}
