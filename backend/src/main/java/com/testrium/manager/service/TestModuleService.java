package com.testrium.manager.service;

import com.testrium.manager.dto.TestModuleDTO;
import com.testrium.manager.exception.ResourceNotFoundException;
import com.testrium.manager.entity.Application;
import com.testrium.manager.entity.Project;
import com.testrium.manager.entity.TestModule;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.ApplicationRepository;
import com.testrium.manager.repository.ProjectRepository;
import com.testrium.manager.repository.TestModuleRepository;
import com.testrium.manager.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestModuleService {

    private final TestModuleRepository testModuleRepository;
    private final ProjectRepository projectRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public TestModuleService(TestModuleRepository testModuleRepository,
                            ProjectRepository projectRepository,
                            ApplicationRepository applicationRepository,
                            UserRepository userRepository) {
        this.testModuleRepository = testModuleRepository;
        this.projectRepository = projectRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TestModuleDTO> getAllModules() {
        List<TestModule> modules = testModuleRepository.findAll();
        // Force load relationships within transaction
        modules.forEach(module -> {
            if (module.getApplication() != null) {
                module.getApplication().getName(); // Force load
            }
            if (module.getProject() != null) {
                module.getProject().getName(); // Force load
            }
            if (module.getCreatedBy() != null) {
                module.getCreatedBy().getUsername(); // Force load
            }
            if (module.getTestCases() != null) {
                module.getTestCases().size(); // Force load
            }
        });
        return modules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestModuleDTO> getModulesByProject(Long projectId) {
        List<TestModule> modules = testModuleRepository.findByProjectId(projectId);
        // Force load relationships within transaction
        modules.forEach(module -> {
            if (module.getApplication() != null) {
                module.getApplication().getName(); // Force load
            }
            if (module.getProject() != null) {
                module.getProject().getName(); // Force load
            }
            if (module.getCreatedBy() != null) {
                module.getCreatedBy().getUsername(); // Force load
            }
            if (module.getTestCases() != null) {
                module.getTestCases().size(); // Force load
            }
        });
        return modules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestModuleDTO getModuleById(Long id) {
        TestModule module = testModuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test module not found with id: " + id));
        // Force load relationships within transaction
        if (module.getApplication() != null) {
            module.getApplication().getName(); // Force load
        }
        if (module.getProject() != null) {
            module.getProject().getName(); // Force load
        }
        if (module.getCreatedBy() != null) {
            module.getCreatedBy().getUsername(); // Force load
        }
        if (module.getTestCases() != null) {
            module.getTestCases().size(); // Force load
        }
        return convertToDTO(module);
    }

    @Transactional
    public TestModuleDTO createModule(TestModuleDTO dto) {
        User currentUser = getCurrentUser();
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getProjectId()));

        // Validate that applicationId is provided for new modules
        if (dto.getApplicationId() == null) {
            throw new IllegalArgumentException("Application ID is required");
        }

        Application application = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + dto.getApplicationId()));

        TestModule module = new TestModule();
        module.setName(dto.getName());
        module.setDescription(dto.getDescription());
        module.setProject(project);
        module.setApplication(application);
        module.setCreatedBy(currentUser);

        TestModule savedModule = testModuleRepository.save(module);
        return convertToDTO(savedModule);
    }

    @Transactional
    public TestModuleDTO updateModule(Long id, TestModuleDTO dto) {
        TestModule module = testModuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test module not found with id: " + id));

        // Validate that applicationId is provided for updates
        if (dto.getApplicationId() == null) {
            throw new IllegalArgumentException("Application ID is required");
        }

        Application application = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + dto.getApplicationId()));

        module.setName(dto.getName());
        module.setDescription(dto.getDescription());
        module.setApplication(application);

        TestModule updatedModule = testModuleRepository.save(module);
        return convertToDTO(updatedModule);
    }

    @Transactional
    public void deleteModule(Long id) {
        TestModule module = testModuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test module not found with id: " + id));
        testModuleRepository.delete(module);
    }

    private TestModuleDTO convertToDTO(TestModule module) {
        TestModuleDTO dto = new TestModuleDTO();
        dto.setId(module.getId());
        dto.setName(module.getName());
        dto.setDescription(module.getDescription());
        dto.setProjectId(module.getProject().getId());
        dto.setProjectName(module.getProject().getName());

        // Handle null application (for legacy data)
        if (module.getApplication() != null) {
            dto.setApplicationId(module.getApplication().getId());
            dto.setApplicationName(module.getApplication().getName());
        }

        dto.setTestCaseCount(module.getTestCases().size());
        dto.setCreatedByUsername(module.getCreatedBy().getUsername());
        dto.setCreatedAt(module.getCreatedAt());
        dto.setUpdatedAt(module.getUpdatedAt());
        return dto;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // JWT stores email as principal
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
