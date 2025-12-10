package com.pramana.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OverallStatsDTO {
    private Long totalProjects;
    private Long totalTestCases;
    private Long totalTestRuns;
    private Long totalExecutions;
    private Long passedExecutions;
    private Long failedExecutions;
    private Long skippedExecutions;
    private Double overallPassRate;
    private List<ProjectStatsDTO> projectStats;
}
