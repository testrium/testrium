package com.pramana.manager.service;

import com.pramana.manager.dto.TestExecutionDTO;
import com.pramana.manager.dto.UpdateTestExecutionRequest;
import com.pramana.manager.entity.TestCase;
import com.pramana.manager.entity.TestExecution;
import com.pramana.manager.entity.User;
import com.pramana.manager.repository.TestCaseRepository;
import com.pramana.manager.repository.TestExecutionRepository;
import com.pramana.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestExecutionService {

    @Autowired
    private TestExecutionRepository testExecutionRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private UserRepository userRepository;

    public List<TestExecutionDTO> getExecutionsByTestRun(Long testRunId) {
        List<TestExecution> executions = testExecutionRepository.findByTestRunId(testRunId);
        return executions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TestExecutionDTO getExecutionById(Long id) {
        TestExecution execution = testExecutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test execution not found"));
        return convertToDTO(execution);
    }

    @Transactional
    public TestExecutionDTO updateExecution(Long id, UpdateTestExecutionRequest request, Long executedByUserId) {
        TestExecution execution = testExecutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test execution not found"));

        // Update fields
        if (request.getStatus() != null) {
            execution.setStatus(request.getStatus());
        }
        if (request.getActualResult() != null) {
            execution.setActualResult(request.getActualResult());
        }
        if (request.getComments() != null) {
            execution.setComments(request.getComments());
        }
        if (request.getExecutionTimeMinutes() != null) {
            execution.setExecutionTimeMinutes(request.getExecutionTimeMinutes());
        }
        if (request.getDefectReference() != null) {
            execution.setDefectReference(request.getDefectReference());
        }

        execution.setExecutedByUserId(executedByUserId);
        execution.setExecutedAt(LocalDateTime.now());
        execution.setUpdatedAt(LocalDateTime.now());

        execution = testExecutionRepository.save(execution);

        return convertToDTO(execution);
    }

    @Transactional
    public TestExecutionDTO bulkUpdateStatus(Long testRunId, Long testCaseId, String status, Long executedByUserId) {
        TestExecution execution = testExecutionRepository
                .findByTestRunIdAndTestCaseId(testRunId, testCaseId)
                .orElseThrow(() -> new RuntimeException("Test execution not found"));

        execution.setStatus(status);
        execution.setExecutedByUserId(executedByUserId);
        execution.setExecutedAt(LocalDateTime.now());
        execution.setUpdatedAt(LocalDateTime.now());

        execution = testExecutionRepository.save(execution);

        return convertToDTO(execution);
    }

    private TestExecutionDTO convertToDTO(TestExecution execution) {
        TestExecutionDTO dto = new TestExecutionDTO();
        dto.setId(execution.getId());
        dto.setTestRunId(execution.getTestRunId());
        dto.setTestCaseId(execution.getTestCaseId());
        dto.setExecutedByUserId(execution.getExecutedByUserId());
        dto.setStatus(execution.getStatus());
        dto.setActualResult(execution.getActualResult());
        dto.setComments(execution.getComments());
        dto.setExecutionTimeMinutes(execution.getExecutionTimeMinutes());
        dto.setDefectReference(execution.getDefectReference());
        dto.setExecutedAt(execution.getExecutedAt());

        // Get test case details
        testCaseRepository.findById(execution.getTestCaseId())
                .ifPresent(testCase -> {
                    dto.setTestCaseTitle(testCase.getTitle());
                    dto.setTestCaseSteps(testCase.getSteps());
                    dto.setTestCaseExpectedResult(testCase.getExpectedResult());
                    dto.setTestCasePreconditions(testCase.getPreconditions());
                });

        // Get executed by user name
        if (execution.getExecutedByUserId() != null) {
            userRepository.findById(execution.getExecutedByUserId())
                    .ifPresent(user -> dto.setExecutedByUsername(user.getUsername()));
        }

        return dto;
    }
}
