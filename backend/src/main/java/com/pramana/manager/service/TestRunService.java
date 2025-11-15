package com.pramana.manager.service;

import com.pramana.manager.dto.CreateTestRunRequest;
import com.pramana.manager.dto.TestRunDTO;
import com.pramana.manager.entity.*;
import com.pramana.manager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TestRunService {

    @Autowired
    private TestRunRepository testRunRepository;

    @Autowired
    private TestExecutionRepository testExecutionRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TestSuiteRepository testSuiteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Transactional
    public TestRunDTO createTestRun(CreateTestRunRequest request, Long createdByUserId) {
        // Validate project exists
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Validate suite if provided
        TestSuite suite = null;
        if (request.getSuiteId() != null) {
            suite = testSuiteRepository.findById(request.getSuiteId())
                    .orElseThrow(() -> new RuntimeException("Test suite not found"));
        }

        // Validate assigned user if provided
        User assignedUser = null;
        if (request.getAssignedToUserId() != null) {
            assignedUser = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
        }

        // Create test run
        TestRun testRun = new TestRun();
        testRun.setName(request.getName());
        testRun.setDescription(request.getDescription());
        testRun.setProjectId(request.getProjectId());
        testRun.setSuiteId(request.getSuiteId());
        testRun.setAssignedToUserId(request.getAssignedToUserId());
        testRun.setStatus("NOT_STARTED");
        testRun.setCreatedByUserId(createdByUserId);
        testRun.setCreatedAt(LocalDateTime.now());
        testRun.setUpdatedAt(LocalDateTime.now());

        testRun = testRunRepository.save(testRun);

        // Create test executions for each test case
        List<TestExecution> executions = new ArrayList<>();
        for (Long testCaseId : request.getTestCaseIds()) {
            TestCase testCase = testCaseRepository.findById(testCaseId)
                    .orElseThrow(() -> new RuntimeException("Test case not found: " + testCaseId));

            TestExecution execution = new TestExecution();
            execution.setTestRunId(testRun.getId());
            execution.setTestCaseId(testCaseId);
            execution.setStatus("NOT_EXECUTED");
            execution.setCreatedAt(LocalDateTime.now());
            execution.setUpdatedAt(LocalDateTime.now());

            executions.add(execution);
        }

        testExecutionRepository.saveAll(executions);

        return convertToDTO(testRun);
    }

    public List<TestRunDTO> getAllTestRuns() {
        List<TestRun> testRuns = testRunRepository.findAll();
        return testRuns.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TestRunDTO> getTestRunsByProject(Long projectId) {
        List<TestRun> testRuns = testRunRepository.findByProjectId(projectId);
        return testRuns.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TestRunDTO getTestRunById(Long id) {
        TestRun testRun = testRunRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test run not found"));
        return convertToDTO(testRun);
    }

    @Transactional
    public TestRunDTO updateTestRunStatus(Long id, String status) {
        TestRun testRun = testRunRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test run not found"));

        testRun.setStatus(status);

        if ("IN_PROGRESS".equals(status) && testRun.getStartDate() == null) {
            testRun.setStartDate(LocalDateTime.now());
        } else if ("COMPLETED".equals(status)) {
            testRun.setEndDate(LocalDateTime.now());
        }

        testRun.setUpdatedAt(LocalDateTime.now());
        testRun = testRunRepository.save(testRun);

        return convertToDTO(testRun);
    }

    @Transactional
    public void deleteTestRun(Long id) {
        TestRun testRun = testRunRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test run not found"));

        // Delete all associated test executions
        List<TestExecution> executions = testExecutionRepository.findByTestRunId(id);
        testExecutionRepository.deleteAll(executions);

        // Delete the test run
        testRunRepository.delete(testRun);
    }

    private TestRunDTO convertToDTO(TestRun testRun) {
        TestRunDTO dto = new TestRunDTO();
        dto.setId(testRun.getId());
        dto.setName(testRun.getName());
        dto.setDescription(testRun.getDescription());
        dto.setProjectId(testRun.getProjectId());
        dto.setSuiteId(testRun.getSuiteId());
        dto.setAssignedToUserId(testRun.getAssignedToUserId());
        dto.setStatus(testRun.getStatus());
        dto.setStartDate(testRun.getStartDate());
        dto.setEndDate(testRun.getEndDate());
        dto.setCreatedByUserId(testRun.getCreatedByUserId());
        dto.setCreatedAt(testRun.getCreatedAt());
        dto.setUpdatedAt(testRun.getUpdatedAt());

        // Set project name
        projectRepository.findById(testRun.getProjectId())
                .ifPresent(project -> dto.setProjectName(project.getName()));

        // Set suite name
        if (testRun.getSuiteId() != null) {
            testSuiteRepository.findById(testRun.getSuiteId())
                    .ifPresent(suite -> dto.setSuiteName(suite.getName()));
        }

        // Set assigned user name
        if (testRun.getAssignedToUserId() != null) {
            userRepository.findById(testRun.getAssignedToUserId())
                    .ifPresent(user -> dto.setAssignedToUsername(user.getUsername()));
        }

        // Set created by user name
        if (testRun.getCreatedByUserId() != null) {
            userRepository.findById(testRun.getCreatedByUserId())
                    .ifPresent(user -> dto.setCreatedByUsername(user.getUsername()));
        }

        // Calculate execution statistics
        List<TestExecution> executions = testExecutionRepository.findByTestRunId(testRun.getId());
        dto.setTotalTestCases(executions.size());

        Map<String, Long> statusCounts = executions.stream()
                .collect(Collectors.groupingBy(TestExecution::getStatus, Collectors.counting()));

        dto.setPassedCount(statusCounts.getOrDefault("PASS", 0L).intValue());
        dto.setFailedCount(statusCounts.getOrDefault("FAIL", 0L).intValue());
        dto.setBlockedCount(statusCounts.getOrDefault("BLOCKED", 0L).intValue());
        dto.setSkippedCount(statusCounts.getOrDefault("SKIPPED", 0L).intValue());
        dto.setNotExecutedCount(statusCounts.getOrDefault("NOT_EXECUTED", 0L).intValue());

        return dto;
    }
}
