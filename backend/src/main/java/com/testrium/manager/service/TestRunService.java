package com.testrium.manager.service;

import com.testrium.manager.dto.CreateTestRunRequest;
import com.testrium.manager.dto.TestRunDTO;
import com.testrium.manager.entity.*;
import com.testrium.manager.repository.*;
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
    private TestModuleRepository testModuleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private WebhookService webhookService;

    @Transactional
    public TestRunDTO createTestRun(CreateTestRunRequest request, Long createdByUserId) {
        // Validate project exists
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Validate module if provided
        TestModule module = null;
        if (request.getModuleId() != null) {
            module = testModuleRepository.findById(request.getModuleId())
                    .orElseThrow(() -> new RuntimeException("Test module not found"));
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
        testRun.setModuleId(request.getModuleId());
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

        // Notify assignee if different from creator
        final TestRun savedRun = testRun;
        if (savedRun.getAssignedToUserId() != null &&
                !savedRun.getAssignedToUserId().equals(createdByUserId)) {
            userRepository.findById(savedRun.getAssignedToUserId()).ifPresent(assignee ->
                emailService.sendTestRunAssigned(
                        assignee.getEmail(),
                        assignee.getUsername(),
                        savedRun.getName(),
                        project.getName(),
                        savedRun.getId(),
                        savedRun.getProjectId()
                )
            );
            webhookService.notifyTestRunAssigned(
                    savedRun.getProjectId(), savedRun.getName(), project.getName(),
                    userRepository.findById(savedRun.getAssignedToUserId())
                            .map(u -> u.getUsername()).orElse("someone"));
        }

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

        // Notify on completion
        if ("COMPLETED".equals(status)) {
            final TestRun completedRun = testRun;
            List<TestExecution> execs = testExecutionRepository.findByTestRunId(id);
            int passed = (int) execs.stream().filter(e -> "PASS".equals(e.getStatus())).count();
            int failed = (int) execs.stream().filter(e -> "FAIL".equals(e.getStatus())).count();
            int total = execs.size();
            String runName = completedRun.getName();
            String projectName = projectRepository.findById(completedRun.getProjectId())
                    .map(p -> p.getName()).orElse("Unknown");

            // Notify assignee
            if (completedRun.getAssignedToUserId() != null) {
                userRepository.findById(completedRun.getAssignedToUserId()).ifPresent(u ->
                    emailService.sendTestRunCompleted(u.getEmail(), u.getUsername(),
                            runName, projectName, passed, failed, total, completedRun.getProjectId())
                );
            }
            // Notify creator (if different from assignee)
            if (completedRun.getCreatedByUserId() != null &&
                    !completedRun.getCreatedByUserId().equals(completedRun.getAssignedToUserId())) {
                userRepository.findById(completedRun.getCreatedByUserId()).ifPresent(u ->
                    emailService.sendTestRunCompleted(u.getEmail(), u.getUsername(),
                            runName, projectName, passed, failed, total, completedRun.getProjectId())
                );
            }
            // Webhook notification
            webhookService.notifyTestRunCompleted(
                    completedRun.getProjectId(), runName, projectName, passed, failed, total);
        }

        return convertToDTO(testRun);
    }

    @Transactional
    public TestRunDTO updateTestRun(Long id, String name, String description, Long assignedToUserId) {
        TestRun testRun = testRunRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test run not found"));

        if (name != null && !name.trim().isEmpty()) {
            testRun.setName(name.trim());
        }
        testRun.setDescription(description);
        testRun.setAssignedToUserId(assignedToUserId);
        testRun.setUpdatedAt(LocalDateTime.now());

        testRun = testRunRepository.save(testRun);
        return convertToDTO(testRun);
    }

    @Transactional
    public TestRunDTO cloneTestRun(Long id, Long currentUserId, String customName) {
        TestRun original = testRunRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test run not found"));

        TestRun clone = new TestRun();
        clone.setName(customName != null && !customName.trim().isEmpty() ? customName.trim() : original.getName());
        clone.setDescription(original.getDescription());
        clone.setProjectId(original.getProjectId());
        clone.setModuleId(original.getModuleId());
        clone.setAssignedToUserId(original.getAssignedToUserId());
        clone.setStatus("NOT_STARTED");
        clone.setCreatedByUserId(currentUserId);
        clone.setCreatedAt(LocalDateTime.now());
        clone.setUpdatedAt(LocalDateTime.now());

        clone = testRunRepository.save(clone);

        List<TestExecution> originalExecutions = testExecutionRepository.findByTestRunId(id);
        List<TestExecution> clonedExecutions = new ArrayList<>();
        for (TestExecution orig : originalExecutions) {
            TestExecution ex = new TestExecution();
            ex.setTestRunId(clone.getId());
            ex.setTestCaseId(orig.getTestCaseId());
            ex.setStatus("NOT_EXECUTED");
            ex.setCreatedAt(LocalDateTime.now());
            ex.setUpdatedAt(LocalDateTime.now());
            clonedExecutions.add(ex);
        }
        testExecutionRepository.saveAll(clonedExecutions);

        return convertToDTO(clone);
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
        dto.setModuleId(testRun.getModuleId());
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

        // Set module name
        if (testRun.getModuleId() != null) {
            testModuleRepository.findById(testRun.getModuleId())
                    .ifPresent(module -> dto.setModuleName(module.getName()));
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
