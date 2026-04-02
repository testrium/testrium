package com.testrium.manager.service;

import com.testrium.manager.dto.TestCaseDTO;
import com.testrium.manager.exception.ResourceNotFoundException;
import com.testrium.manager.entity.Project;
import com.testrium.manager.entity.TestCase;
import com.testrium.manager.entity.TestModule;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.ProjectRepository;
import com.testrium.manager.repository.TestCaseRepository;
import com.testrium.manager.repository.TestModuleRepository;
import com.testrium.manager.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProjectRepository projectRepository;
    private final TestModuleRepository testModuleRepository;
    private final UserRepository userRepository;

    public TestCaseService(TestCaseRepository testCaseRepository,
                           ProjectRepository projectRepository,
                           TestModuleRepository testModuleRepository,
                           UserRepository userRepository) {
        this.testCaseRepository = testCaseRepository;
        this.projectRepository = projectRepository;
        this.testModuleRepository = testModuleRepository;
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
    public List<TestCaseDTO> getTestCasesByModule(Long moduleId) {
        return testCaseRepository.findByModuleId(moduleId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestCaseDTO> getTestCasesByFilters(Long projectId, Long moduleId,
                                                    TestCase.TestCaseStatus status,
                                                    TestCase.Priority priority,
                                                    String tag) {
        List<TestCase> results = (tag != null && !tag.isBlank())
                ? testCaseRepository.findByFiltersAndTag(projectId, moduleId, status, priority, tag.toLowerCase().trim())
                : testCaseRepository.findByFilters(projectId, moduleId, status, priority);
        return results.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getTagsByProject(Long projectId) {
        return testCaseRepository.findDistinctTagsByProjectId(projectId);
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
        testCase.setIsAutomated(dto.getIsAutomated() != null ? dto.getIsAutomated() : false);
        testCase.setIsRegression(dto.getIsRegression() != null ? dto.getIsRegression() : false);
        testCase.setTags(normalizeTags(dto.getTags()));

        if (dto.getModuleId() != null) {
            TestModule module = testModuleRepository.findById(dto.getModuleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Test module not found with id: " + dto.getModuleId()));
            testCase.setModule(module);
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
        testCase.setIsAutomated(dto.getIsAutomated() != null ? dto.getIsAutomated() : false);
        testCase.setIsRegression(dto.getIsRegression() != null ? dto.getIsRegression() : false);
        testCase.setTags(normalizeTags(dto.getTags()));

        if (dto.getModuleId() != null) {
            TestModule module = testModuleRepository.findById(dto.getModuleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Test module not found with id: " + dto.getModuleId()));
            testCase.setModule(module);
        } else {
            testCase.setModule(null);
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

        if (testCase.getModule() != null) {
            dto.setModuleId(testCase.getModule().getId());
            dto.setModuleName(testCase.getModule().getName());
            if (testCase.getModule().getApplication() != null) {
                dto.setApplicationName(testCase.getModule().getApplication().getName());
            }
        }

        dto.setCreatedByUsername(testCase.getCreatedBy().getUsername());
        if (testCase.getUpdatedBy() != null) {
            dto.setUpdatedByUsername(testCase.getUpdatedBy().getUsername());
        }
        dto.setCreatedAt(testCase.getCreatedAt());
        dto.setUpdatedAt(testCase.getUpdatedAt());
        dto.setIsAutomated(testCase.getIsAutomated());
        dto.setIsRegression(testCase.getIsRegression());
        dto.setTags(testCase.getTags() != null
                ? testCase.getTags().stream().sorted().collect(Collectors.toList())
                : new java.util.ArrayList<>());

        return dto;
    }

    private Set<String> normalizeTags(List<String> tags) {
        if (tags == null) return new HashSet<>();
        return tags.stream()
                .filter(t -> t != null && !t.isBlank())
                .map(t -> t.toLowerCase().trim())
                .filter(t -> t.length() <= 50)
                .collect(Collectors.toSet());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // JWT stores email as principal
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
