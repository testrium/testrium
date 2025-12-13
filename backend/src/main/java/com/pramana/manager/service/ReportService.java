package com.pramana.manager.service;

import com.pramana.manager.dto.*;
import com.pramana.manager.entity.*;
import com.pramana.manager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private TestRunRepository testRunRepository;

    @Autowired
    private TestExecutionRepository testExecutionRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReportTemplateRepository reportTemplateRepository;

    public OverallStatsDTO getOverallStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<Project> projects;
        if ("ADMIN".equals(user.getRole())) {
            projects = projectRepository.findAll();
        } else {
            List<Long> projectIds = projectMemberRepository.findByUserId(user.getId())
                .stream()
                .map(pm -> pm.getProjectId())
                .collect(Collectors.toList());
            projects = projectRepository.findAllById(projectIds);
        }

        OverallStatsDTO stats = new OverallStatsDTO();
        stats.setTotalProjects((long) projects.size());

        long totalTestCases = 0;
        long totalTestRuns = 0;
        long totalExecutions = 0;
        long passedExecutions = 0;
        long failedExecutions = 0;
        long skippedExecutions = 0;

        List<ProjectStatsDTO> projectStatsList = new ArrayList<>();

        for (Project project : projects) {
            ProjectStatsDTO projectStats = getProjectStats(project.getId());
            projectStatsList.add(projectStats);

            totalTestCases += projectStats.getTotalTestCases();
            totalTestRuns += projectStats.getTotalTestRuns();
            totalExecutions += projectStats.getTotalExecutions();
            passedExecutions += projectStats.getPassedExecutions();
            failedExecutions += projectStats.getFailedExecutions();
            skippedExecutions += projectStats.getSkippedExecutions();
        }

        stats.setTotalTestCases(totalTestCases);
        stats.setTotalTestRuns(totalTestRuns);
        stats.setTotalExecutions(totalExecutions);
        stats.setPassedExecutions(passedExecutions);
        stats.setFailedExecutions(failedExecutions);
        stats.setSkippedExecutions(skippedExecutions);
        stats.setOverallPassRate(totalExecutions > 0 ? (passedExecutions * 100.0 / totalExecutions) : 0.0);
        stats.setProjectStats(projectStatsList);

        return stats;
    }

    public ProjectStatsDTO getProjectStats(Long projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));

        ProjectStatsDTO stats = new ProjectStatsDTO();
        stats.setProjectId(project.getId());
        stats.setProjectName(project.getName());

        long totalTestCases = testCaseRepository.countByProjectId(projectId);
        long totalTestRuns = testRunRepository.countByProjectId(projectId);

        List<TestExecution> executions = testExecutionRepository.findAll().stream()
            .filter(e -> {
                return testRunRepository.findById(e.getTestRunId())
                    .map(tr -> tr.getProjectId().equals(projectId))
                    .orElse(false);
            })
            .collect(Collectors.toList());

        long totalExecutions = executions.size();
        long passed = executions.stream().filter(e -> "PASS".equals(e.getStatus())).count();
        long failed = executions.stream().filter(e -> "FAIL".equals(e.getStatus()) || "BLOCKED".equals(e.getStatus())).count();
        long skipped = executions.stream().filter(e -> "SKIPPED".equals(e.getStatus()) || "NOT_EXECUTED".equals(e.getStatus())).count();

        stats.setTotalTestCases(totalTestCases);
        stats.setTotalTestRuns(totalTestRuns);
        stats.setTotalExecutions(totalExecutions);
        stats.setPassedExecutions(passed);
        stats.setFailedExecutions(failed);
        stats.setSkippedExecutions(skipped);
        stats.setPassRate(totalExecutions > 0 ? (passed * 100.0 / totalExecutions) : 0.0);

        return stats;
    }

    public TestRunReportDTO getTestRunReport(Long testRunId) {
        TestRun testRun = testRunRepository.findById(testRunId)
            .orElseThrow(() -> new RuntimeException("Test Run not found"));

        Project project = projectRepository.findById(testRun.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));

        List<TestExecution> executions = testExecutionRepository.findAll().stream()
            .filter(e -> e.getTestRunId().equals(testRunId))
            .collect(Collectors.toList());

        long passed = executions.stream().filter(e -> "PASS".equals(e.getStatus())).count();
        long failed = executions.stream().filter(e -> "FAIL".equals(e.getStatus()) || "BLOCKED".equals(e.getStatus())).count();
        long skipped = executions.stream().filter(e -> "SKIPPED".equals(e.getStatus()) || "NOT_EXECUTED".equals(e.getStatus())).count();

        List<TestRunDetailDTO> testCaseDetails = new ArrayList<>();
        for (TestExecution execution : executions) {
            TestCase testCase = testCaseRepository.findById(execution.getTestCaseId())
                .orElse(null);

            if (testCase != null) {
                String executedByName = null;
                if (execution.getExecutedByUserId() != null) {
                    User executedBy = userRepository.findById(execution.getExecutedByUserId()).orElse(null);
                    if (executedBy != null) {
                        executedByName = executedBy.getUsername();
                    }
                }

                TestRunDetailDTO detail = new TestRunDetailDTO(
                    testCase.getId(),
                    testCase.getTitle(),
                    testCase.getDescription(),
                    testCase.getPriority() != null ? testCase.getPriority().toString() : null,
                    execution.getStatus(),
                    execution.getActualResult(),
                    execution.getComments(),
                    executedByName,
                    execution.getExecutedAt(),
                    execution.getExecutionTimeMinutes(),
                    execution.getDefectReference()
                );
                testCaseDetails.add(detail);
            }
        }

        TestRunReportDTO report = new TestRunReportDTO();
        report.setTestRunId(testRun.getId());
        report.setTestRunName(testRun.getName());
        report.setProjectName(project.getName());
        report.setStatus(testRun.getStatus());
        report.setCreatedAt(testRun.getCreatedAt());
        report.setCompletedAt(testRun.getEndDate());
        report.setTotalTestCases((long) executions.size());
        report.setPassedExecutions(passed);
        report.setFailedExecutions(failed);
        report.setSkippedExecutions(skipped);
        report.setPassRate(executions.size() > 0 ? (passed * 100.0 / executions.size()) : 0.0);
        report.setTestCases(testCaseDetails);

        return report;
    }

    // Trend Analysis
    public List<TrendDataDTO> getTrendAnalysis(Long projectId, Integer limit) {
        List<TestRun> testRuns = testRunRepository.findByProjectId(projectId).stream()
            .filter(tr -> "COMPLETED".equals(tr.getStatus()))
            .sorted(Comparator.comparing(TestRun::getEndDate).reversed())
            .limit(limit != null ? limit : 10)
            .collect(Collectors.toList());

        List<TrendDataDTO> trendData = new ArrayList<>();

        for (TestRun testRun : testRuns) {
            List<TestExecution> executions = testExecutionRepository.findByTestRunId(testRun.getId());

            long total = executions.size();
            long passed = executions.stream().filter(e -> "PASS".equals(e.getStatus())).count();
            long failed = executions.stream().filter(e -> "FAIL".equals(e.getStatus()) || "BLOCKED".equals(e.getStatus())).count();
            long skipped = executions.stream().filter(e -> "SKIPPED".equals(e.getStatus()) || "NOT_EXECUTED".equals(e.getStatus())).count();

            double passRate = total > 0 ? (passed * 100.0 / total) : 0.0;

            TrendDataDTO data = new TrendDataDTO(
                testRun.getEndDate(),
                testRun.getName(),
                testRun.getId(),
                total,
                passed,
                failed,
                skipped,
                passRate
            );
            trendData.add(data);
        }

        // Reverse to get chronological order
        java.util.Collections.reverse(trendData);
        return trendData;
    }

    // Report Template CRUD
    @Transactional
    public ReportTemplateDTO createTemplate(ReportTemplateDTO dto, Long userId) {
        ReportTemplate template = new ReportTemplate();
        template.setName(dto.getName());
        template.setDescription(dto.getDescription());
        template.setCreatedByUserId(userId);
        template.setProjectId(dto.getProjectId());
        template.setIncludeOverallStats(dto.getIncludeOverallStats());
        template.setIncludeProjectStats(dto.getIncludeProjectStats());
        template.setIncludeTestRunDetails(dto.getIncludeTestRunDetails());
        template.setIncludeTrendAnalysis(dto.getIncludeTrendAnalysis());
        template.setIncludeCharts(dto.getIncludeCharts());
        template.setExportFormat(dto.getExportFormat());

        template = reportTemplateRepository.save(template);
        return convertTemplateToDTO(template);
    }

    public List<ReportTemplateDTO> getUserTemplates(Long userId) {
        return reportTemplateRepository.findByCreatedByUserId(userId).stream()
            .map(this::convertTemplateToDTO)
            .collect(Collectors.toList());
    }

    public ReportTemplateDTO getTemplateById(Long id) {
        ReportTemplate template = reportTemplateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Template not found"));
        return convertTemplateToDTO(template);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        reportTemplateRepository.deleteById(id);
    }

    private ReportTemplateDTO convertTemplateToDTO(ReportTemplate template) {
        ReportTemplateDTO dto = new ReportTemplateDTO();
        dto.setId(template.getId());
        dto.setName(template.getName());
        dto.setDescription(template.getDescription());
        dto.setCreatedByUserId(template.getCreatedByUserId());
        dto.setProjectId(template.getProjectId());
        dto.setIncludeOverallStats(template.getIncludeOverallStats());
        dto.setIncludeProjectStats(template.getIncludeProjectStats());
        dto.setIncludeTestRunDetails(template.getIncludeTestRunDetails());
        dto.setIncludeTrendAnalysis(template.getIncludeTrendAnalysis());
        dto.setIncludeCharts(template.getIncludeCharts());
        dto.setExportFormat(template.getExportFormat());
        dto.setCreatedAt(template.getCreatedAt());
        dto.setUpdatedAt(template.getUpdatedAt());

        // Set username
        userRepository.findById(template.getCreatedByUserId())
            .ifPresent(user -> dto.setCreatedByUsername(user.getUsername()));

        // Set project name
        if (template.getProjectId() != null) {
            projectRepository.findById(template.getProjectId())
                .ifPresent(project -> dto.setProjectName(project.getName()));
        }

        return dto;
    }
}
