package com.pramana.manager.service;

import com.pramana.manager.dto.TestCaseMetricsDTO;
import com.pramana.manager.entity.TestCase;
import com.pramana.manager.repository.TestCaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TestCaseMetricsService {

    private final TestCaseRepository testCaseRepository;

    public TestCaseMetricsService(TestCaseRepository testCaseRepository) {
        this.testCaseRepository = testCaseRepository;
    }

    @Transactional(readOnly = true)
    public TestCaseMetricsDTO getModuleMetrics(Long moduleId) {
        List<TestCase> testCases = testCaseRepository.findByModuleId(moduleId);

        TestCaseMetricsDTO metrics = new TestCaseMetricsDTO();
        metrics.setEntityId(moduleId);
        metrics.setEntityType("MODULE");

        calculateMetrics(testCases, metrics);

        return metrics;
    }

    @Transactional(readOnly = true)
    public TestCaseMetricsDTO getApplicationMetrics(Long applicationId) {
        List<TestCase> testCases = testCaseRepository.findAll().stream()
                .filter(tc -> tc.getModule() != null &&
                             tc.getModule().getApplication() != null &&
                             tc.getModule().getApplication().getId().equals(applicationId))
                .toList();

        TestCaseMetricsDTO metrics = new TestCaseMetricsDTO();
        metrics.setEntityId(applicationId);
        metrics.setEntityType("APPLICATION");

        calculateMetrics(testCases, metrics);

        return metrics;
    }

    @Transactional(readOnly = true)
    public TestCaseMetricsDTO getProjectMetrics(Long projectId) {
        List<TestCase> testCases = testCaseRepository.findByProjectId(projectId);

        TestCaseMetricsDTO metrics = new TestCaseMetricsDTO();
        metrics.setEntityId(projectId);
        metrics.setEntityType("PROJECT");

        calculateMetrics(testCases, metrics);

        return metrics;
    }

    @Transactional(readOnly = true)
    public List<TestCaseMetricsDTO> getAllApplicationMetricsForProject(Long projectId) {
        // Get all test cases for the project
        List<TestCase> projectTestCases = testCaseRepository.findByProjectId(projectId);

        // Group by application and calculate metrics
        return projectTestCases.stream()
                .filter(tc -> tc.getModule() != null && tc.getModule().getApplication() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        tc -> tc.getModule().getApplication()
                ))
                .entrySet().stream()
                .map(entry -> {
                    TestCaseMetricsDTO metrics = new TestCaseMetricsDTO();
                    metrics.setEntityId(entry.getKey().getId());
                    metrics.setEntityName(entry.getKey().getName());
                    metrics.setEntityType("APPLICATION");
                    calculateMetrics(entry.getValue(), metrics);
                    return metrics;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TestCaseMetricsDTO> getAllModuleMetricsForApplication(Long applicationId) {
        List<TestCase> appTestCases = testCaseRepository.findAll().stream()
                .filter(tc -> tc.getModule() != null &&
                             tc.getModule().getApplication() != null &&
                             tc.getModule().getApplication().getId().equals(applicationId))
                .toList();

        // Group by module and calculate metrics
        return appTestCases.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        TestCase::getModule
                ))
                .entrySet().stream()
                .map(entry -> {
                    TestCaseMetricsDTO metrics = new TestCaseMetricsDTO();
                    metrics.setEntityId(entry.getKey().getId());
                    metrics.setEntityName(entry.getKey().getName());
                    metrics.setEntityType("MODULE");
                    calculateMetrics(entry.getValue(), metrics);
                    return metrics;
                })
                .toList();
    }

    private void calculateMetrics(List<TestCase> testCases, TestCaseMetricsDTO metrics) {
        int total = testCases.size();
        metrics.setTotalTestCases(total);

        if (total == 0) {
            return; // Avoid division by zero
        }

        // Status breakdown
        long active = testCases.stream().filter(tc -> tc.getStatus() == TestCase.TestCaseStatus.ACTIVE).count();
        long draft = testCases.stream().filter(tc -> tc.getStatus() == TestCase.TestCaseStatus.DRAFT).count();
        long deprecated = testCases.stream().filter(tc -> tc.getStatus() == TestCase.TestCaseStatus.DEPRECATED).count();

        metrics.setActiveTestCases((int) active);
        metrics.setDraftTestCases((int) draft);
        metrics.setDeprecatedTestCases((int) deprecated);

        // Automation metrics
        long automated = testCases.stream().filter(tc -> Boolean.TRUE.equals(tc.getIsAutomated())).count();
        long manual = total - automated;

        metrics.setAutomatedTestCases((int) automated);
        metrics.setManualTestCases((int) manual);
        metrics.setAutomationPercentage(Math.round((automated * 100.0 / total) * 100.0) / 100.0);

        // Regression metrics
        long regression = testCases.stream().filter(tc -> Boolean.TRUE.equals(tc.getIsRegression())).count();
        long nonRegression = total - regression;

        metrics.setRegressionTestCases((int) regression);
        metrics.setNonRegressionTestCases((int) nonRegression);
        metrics.setRegressionPercentage(Math.round((regression * 100.0 / total) * 100.0) / 100.0);

        // Priority breakdown
        long low = testCases.stream().filter(tc -> tc.getPriority() == TestCase.Priority.LOW).count();
        long medium = testCases.stream().filter(tc -> tc.getPriority() == TestCase.Priority.MEDIUM).count();
        long high = testCases.stream().filter(tc -> tc.getPriority() == TestCase.Priority.HIGH).count();
        long critical = testCases.stream().filter(tc -> tc.getPriority() == TestCase.Priority.CRITICAL).count();

        metrics.setLowPriority((int) low);
        metrics.setMediumPriority((int) medium);
        metrics.setHighPriority((int) high);
        metrics.setCriticalPriority((int) critical);
    }
}
