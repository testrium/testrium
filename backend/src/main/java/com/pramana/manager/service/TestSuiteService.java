package com.pramana.manager.service;

import com.pramana.manager.dto.TestSuiteDTO;
import com.pramana.manager.exception.ResourceNotFoundException;
import com.pramana.manager.entity.Application;
import com.pramana.manager.entity.Project;
import com.pramana.manager.entity.TestSuite;
import com.pramana.manager.entity.User;
import com.pramana.manager.repository.ApplicationRepository;
import com.pramana.manager.repository.ProjectRepository;
import com.pramana.manager.repository.TestSuiteRepository;
import com.pramana.manager.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestSuiteService {

    private final TestSuiteRepository testSuiteRepository;
    private final ProjectRepository projectRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public TestSuiteService(TestSuiteRepository testSuiteRepository,
                            ProjectRepository projectRepository,
                            ApplicationRepository applicationRepository,
                            UserRepository userRepository) {
        this.testSuiteRepository = testSuiteRepository;
        this.projectRepository = projectRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TestSuiteDTO> getAllSuites() {
        List<TestSuite> suites = testSuiteRepository.findAll();
        // Force load relationships within transaction
        suites.forEach(suite -> {
            if (suite.getApplication() != null) {
                suite.getApplication().getName(); // Force load
            }
            if (suite.getProject() != null) {
                suite.getProject().getName(); // Force load
            }
            if (suite.getCreatedBy() != null) {
                suite.getCreatedBy().getUsername(); // Force load
            }
            if (suite.getTestCases() != null) {
                suite.getTestCases().size(); // Force load
            }
        });
        return suites.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestSuiteDTO> getSuitesByProject(Long projectId) {
        List<TestSuite> suites = testSuiteRepository.findByProjectId(projectId);
        // Force load relationships within transaction
        suites.forEach(suite -> {
            if (suite.getApplication() != null) {
                suite.getApplication().getName(); // Force load
            }
            if (suite.getProject() != null) {
                suite.getProject().getName(); // Force load
            }
            if (suite.getCreatedBy() != null) {
                suite.getCreatedBy().getUsername(); // Force load
            }
            if (suite.getTestCases() != null) {
                suite.getTestCases().size(); // Force load
            }
        });
        return suites.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestSuiteDTO getSuiteById(Long id) {
        TestSuite suite = testSuiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test suite not found with id: " + id));
        // Force load relationships within transaction
        if (suite.getApplication() != null) {
            suite.getApplication().getName(); // Force load
        }
        if (suite.getProject() != null) {
            suite.getProject().getName(); // Force load
        }
        if (suite.getCreatedBy() != null) {
            suite.getCreatedBy().getUsername(); // Force load
        }
        if (suite.getTestCases() != null) {
            suite.getTestCases().size(); // Force load
        }
        return convertToDTO(suite);
    }

    @Transactional
    public TestSuiteDTO createSuite(TestSuiteDTO dto) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getProjectId()));

        // Validate that applicationId is provided for new suites
        if (dto.getApplicationId() == null) {
            throw new IllegalArgumentException("Application ID is required");
        }

        Application application = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + dto.getApplicationId()));

        TestSuite suite = new TestSuite();
        suite.setName(dto.getName());
        suite.setDescription(dto.getDescription());
        suite.setProject(project);
        suite.setApplication(application);
        suite.setCreatedBy(currentUser);

        TestSuite savedSuite = testSuiteRepository.save(suite);
        return convertToDTO(savedSuite);
    }

    @Transactional
    public TestSuiteDTO updateSuite(Long id, TestSuiteDTO dto) {
        TestSuite suite = testSuiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test suite not found with id: " + id));

        // Validate that applicationId is provided for updates
        if (dto.getApplicationId() == null) {
            throw new IllegalArgumentException("Application ID is required");
        }

        Application application = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + dto.getApplicationId()));

        suite.setName(dto.getName());
        suite.setDescription(dto.getDescription());
        suite.setApplication(application);

        TestSuite updatedSuite = testSuiteRepository.save(suite);
        return convertToDTO(updatedSuite);
    }

    @Transactional
    public void deleteSuite(Long id) {
        TestSuite suite = testSuiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test suite not found with id: " + id));
        testSuiteRepository.delete(suite);
    }

    private TestSuiteDTO convertToDTO(TestSuite suite) {
        TestSuiteDTO dto = new TestSuiteDTO();
        dto.setId(suite.getId());
        dto.setName(suite.getName());
        dto.setDescription(suite.getDescription());
        dto.setProjectId(suite.getProject().getId());
        dto.setProjectName(suite.getProject().getName());

        // Handle null application (for legacy data)
        if (suite.getApplication() != null) {
            dto.setApplicationId(suite.getApplication().getId());
            dto.setApplicationName(suite.getApplication().getName());
        }

        dto.setTestCaseCount(suite.getTestCases().size());
        dto.setCreatedByUsername(suite.getCreatedBy().getUsername());
        dto.setCreatedAt(suite.getCreatedAt());
        dto.setUpdatedAt(suite.getUpdatedAt());
        return dto;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // JWT stores email as principal
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
