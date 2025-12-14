package com.pramana.manager.service;

import com.pramana.manager.dto.TestDataDTO;
import com.pramana.manager.entity.Project;
import com.pramana.manager.entity.TestData;
import com.pramana.manager.entity.User;
import com.pramana.manager.repository.ProjectRepository;
import com.pramana.manager.repository.TestDataRepository;
import com.pramana.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestDataService {

    @Autowired
    private TestDataRepository testDataRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public TestDataDTO createTestData(TestDataDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        TestData testData = new TestData();
        testData.setName(dto.getName());
        testData.setDescription(dto.getDescription());
        testData.setProject(project);
        testData.setEnvironment(dto.getEnvironment());
        testData.setDataType(dto.getDataType());
        testData.setDataContent(dto.getDataContent());
        testData.setCreatedBy(user);
        testData.setIsActive(true);

        testData = testDataRepository.save(testData);
        return convertToDTO(testData);
    }

    @Transactional
    public TestDataDTO updateTestData(Long id, TestDataDTO dto) {
        TestData testData = testDataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test Data not found"));

        testData.setName(dto.getName());
        testData.setDescription(dto.getDescription());
        testData.setEnvironment(dto.getEnvironment());
        testData.setDataType(dto.getDataType());
        testData.setDataContent(dto.getDataContent());

        testData = testDataRepository.save(testData);
        return convertToDTO(testData);
    }

    public TestDataDTO getTestDataById(Long id) {
        TestData testData = testDataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test Data not found"));
        return convertToDTO(testData);
    }

    public List<TestDataDTO> getTestDataByProject(Long projectId) {
        return testDataRepository.findByProjectIdAndIsActiveTrue(projectId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TestDataDTO> getTestDataByProjectAndEnvironment(Long projectId, String environment) {
        return testDataRepository.findByProjectIdAndEnvironmentAndIsActiveTrue(projectId, environment)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTestData(Long id) {
        TestData testData = testDataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test Data not found"));
        testData.setIsActive(false);
        testDataRepository.save(testData);
    }

    private TestDataDTO convertToDTO(TestData testData) {
        TestDataDTO dto = new TestDataDTO();
        dto.setId(testData.getId());
        dto.setName(testData.getName());
        dto.setDescription(testData.getDescription());
        dto.setProjectId(testData.getProject().getId());
        dto.setProjectName(testData.getProject().getName());
        dto.setEnvironment(testData.getEnvironment());
        dto.setDataType(testData.getDataType());
        dto.setDataContent(testData.getDataContent());
        dto.setCreatedById(testData.getCreatedBy().getId());
        dto.setCreatedByName(testData.getCreatedBy().getEmail());
        dto.setCreatedAt(testData.getCreatedAt());
        dto.setUpdatedAt(testData.getUpdatedAt());
        dto.setIsActive(testData.getIsActive());
        return dto;
    }
}
