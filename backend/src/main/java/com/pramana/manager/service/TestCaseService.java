package com.pramana.manager.service;

import com.pramana.manager.dto.TestCaseDTO;
import com.pramana.manager.exception.ResourceNotFoundException;
import com.pramana.manager.entity.Project;
import com.pramana.manager.entity.TestCase;
import com.pramana.manager.entity.TestSuite;
import com.pramana.manager.entity.User;
import com.pramana.manager.repository.ProjectRepository;
import com.pramana.manager.repository.TestCaseRepository;
import com.pramana.manager.repository.TestSuiteRepository;
import com.pramana.manager.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProjectRepository projectRepository;
    private final TestSuiteRepository testSuiteRepository;
    private final UserRepository userRepository;

    public TestCaseService(TestCaseRepository testCaseRepository,
                           ProjectRepository projectRepository,
                           TestSuiteRepository testSuiteRepository,
                           UserRepository userRepository) {
        this.testCaseRepository = testCaseRepository;
        this.projectRepository = projectRepository;
        this.testSuiteRepository = testSuiteRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TestCaseDTO> getAllTestCases() {
        return testCaseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestCaseDTO> getTestCasesByProject(Long projectId) {
        return testCaseRepository.findByProjectId(projectId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestCaseDTO> getTestCasesBySuite(Long suiteId) {
        return testCaseRepository.findBySuiteId(suiteId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestCaseDTO> getTestCasesByFilters(Long projectId, Long suiteId,
                                                    TestCase.TestCaseStatus status,
                                                    TestCase.Priority priority) {
        return testCaseRepository.findByFilters(projectId, suiteId, status, priority).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestCaseDTO getTestCaseById(Long id) {
        TestCase testCase = testCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test case not found with id: " + id));
        return convertToDTO(testCase);
    }

    @Transactional
    public TestCaseDTO createTestCase(TestCaseDTO dto) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getProjectId()));

        TestCase testCase = new TestCase();
        testCase.setTitle(dto.getTitle());
        testCase.setDescription(dto.getDescription());
        testCase.setPreconditions(dto.getPreconditions());
        testCase.setSteps(dto.getSteps());
        testCase.setExpectedResult(dto.getExpectedResult());
        testCase.setPriority(dto.getPriority());
        testCase.setStatus(dto.getStatus());
        testCase.setType(dto.getType());
        testCase.setProject(project);
        testCase.setCreatedBy(currentUser);

        if (dto.getSuiteId() != null) {
            TestSuite suite = testSuiteRepository.findById(dto.getSuiteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Test suite not found with id: " + dto.getSuiteId()));
            testCase.setSuite(suite);
        }

        TestCase savedTestCase = testCaseRepository.save(testCase);
        return convertToDTO(savedTestCase);
    }

    @Transactional
    public TestCaseDTO updateTestCase(Long id, TestCaseDTO dto) {
        User currentUser = getCurrentUser();
        TestCase testCase = testCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test case not found with id: " + id));

        testCase.setTitle(dto.getTitle());
        testCase.setDescription(dto.getDescription());
        testCase.setPreconditions(dto.getPreconditions());
        testCase.setSteps(dto.getSteps());
        testCase.setExpectedResult(dto.getExpectedResult());
        testCase.setPriority(dto.getPriority());
        testCase.setStatus(dto.getStatus());
        testCase.setType(dto.getType());
        testCase.setUpdatedBy(currentUser);

        if (dto.getSuiteId() != null) {
            TestSuite suite = testSuiteRepository.findById(dto.getSuiteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Test suite not found with id: " + dto.getSuiteId()));
            testCase.setSuite(suite);
        } else {
            testCase.setSuite(null);
        }

        TestCase updatedTestCase = testCaseRepository.save(testCase);
        return convertToDTO(updatedTestCase);
    }

    @Transactional
    public void deleteTestCase(Long id) {
        TestCase testCase = testCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test case not found with id: " + id));
        testCaseRepository.delete(testCase);
    }

    private TestCaseDTO convertToDTO(TestCase testCase) {
        TestCaseDTO dto = new TestCaseDTO();
        dto.setId(testCase.getId());
        dto.setTitle(testCase.getTitle());
        dto.setDescription(testCase.getDescription());
        dto.setPreconditions(testCase.getPreconditions());
        dto.setSteps(testCase.getSteps());
        dto.setExpectedResult(testCase.getExpectedResult());
        dto.setPriority(testCase.getPriority());
        dto.setStatus(testCase.getStatus());
        dto.setType(testCase.getType());
        dto.setProjectId(testCase.getProject().getId());
        dto.setProjectName(testCase.getProject().getName());

        if (testCase.getSuite() != null) {
            dto.setSuiteId(testCase.getSuite().getId());
            dto.setSuiteName(testCase.getSuite().getName());
        }

        dto.setCreatedByUsername(testCase.getCreatedBy().getUsername());
        if (testCase.getUpdatedBy() != null) {
            dto.setUpdatedByUsername(testCase.getUpdatedBy().getUsername());
        }
        dto.setCreatedAt(testCase.getCreatedAt());
        dto.setUpdatedAt(testCase.getUpdatedAt());

        return dto;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // JWT stores email as principal
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
