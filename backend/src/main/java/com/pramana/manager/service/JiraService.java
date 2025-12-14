package com.pramana.manager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.pramana.manager.dto.JiraConfigurationDTO;
import com.pramana.manager.dto.JiraIssueDTO;
import com.pramana.manager.entity.*;
import com.pramana.manager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

@Service
public class JiraService {

    @Autowired
    private JiraConfigurationRepository jiraConfigRepository;

    @Autowired
    private TestExecutionRepository testExecutionRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private TestRunRepository testRunRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Simple encryption key - In production, use proper key management
    private static final String ENCRYPTION_KEY = "PramanaJiraKey16"; // 16 chars for AES-128

    // Encrypt API token before storing
    public String encryptApiToken(String apiToken) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(ENCRYPTION_KEY.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encrypted = cipher.doFinal(apiToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting API token", e);
        }
    }

    // Decrypt API token when using
    private String decryptApiToken(String encryptedToken) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(ENCRYPTION_KEY.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedToken));
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting API token", e);
        }
    }

    @Transactional
    public JiraConfigurationDTO saveConfiguration(JiraConfigurationDTO dto, Long userId) {
        JiraConfiguration config;

        if (dto.getId() != null) {
            // Update existing
            config = jiraConfigRepository.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("JIRA configuration not found"));
        } else {
            // Create new
            config = new JiraConfiguration();
            config.setProjectId(dto.getProjectId());
            config.setCreatedByUserId(userId);
        }

        config.setJiraUrl(dto.getJiraUrl().trim());
        config.setJiraProjectKey(dto.getJiraProjectKey().trim().toUpperCase());
        config.setJiraUsername(dto.getJiraUsername().trim());

        // Encrypt API token if provided (not masked)
        if (dto.getJiraApiToken() != null && !dto.getJiraApiToken().startsWith("***")) {
            config.setJiraApiToken(encryptApiToken(dto.getJiraApiToken()));
        }

        config.setDefaultIssueType(dto.getDefaultIssueType());
        config.setDefaultPriority(dto.getDefaultPriority());
        config.setEnableUserMapping(dto.getEnableUserMapping());
        config.setUserMappings(dto.getUserMappings());
        config.setIsEnabled(dto.getIsEnabled());

        config = jiraConfigRepository.save(config);
        return convertToDTO(config);
    }

    public Optional<JiraConfigurationDTO> getConfigurationByProjectId(Long projectId) {
        return jiraConfigRepository.findByProjectId(projectId)
            .map(this::convertToDTO);
    }

    @Transactional
    public void deleteConfiguration(Long configId) {
        jiraConfigRepository.deleteById(configId);
    }

    public JiraIssueDTO createJiraIssue(JiraIssueDTO issueDTO, Long projectId, String currentUserEmail) {
        try {
            // Get JIRA configuration
            JiraConfiguration config = jiraConfigRepository.findByProjectId(projectId)
                .orElseThrow(() -> new RuntimeException("JIRA is not configured for this project"));

            if (!config.getIsEnabled()) {
                throw new RuntimeException("JIRA integration is disabled for this project");
            }

            // Get test execution details
            TestExecution execution = testExecutionRepository.findById(issueDTO.getTestExecutionId())
                .orElseThrow(() -> new RuntimeException("Test execution not found"));

            TestCase testCase = testCaseRepository.findById(execution.getTestCaseId())
                .orElseThrow(() -> new RuntimeException("Test case not found"));

            TestRun testRun = testRunRepository.findById(execution.getTestRunId())
                .orElseThrow(() -> new RuntimeException("Test run not found"));

            // Build JIRA issue payload
            ObjectNode payload = objectMapper.createObjectNode();
            ObjectNode fields = objectMapper.createObjectNode();

            // Project
            ObjectNode projectNode = objectMapper.createObjectNode();
            projectNode.put("key", config.getJiraProjectKey());
            fields.set("project", projectNode);

            // Summary
            String summary = issueDTO.getSummary() != null ? issueDTO.getSummary() :
                "Test Failed: " + testCase.getTitle();
            fields.put("summary", summary);

            // Description - Atlassian Document Format (ADF)
            ObjectNode descriptionADF = objectMapper.createObjectNode();
            descriptionADF.put("type", "doc");
            descriptionADF.put("version", 1);
            ArrayNode content = objectMapper.createArrayNode();

            ObjectNode paragraph = objectMapper.createObjectNode();
            paragraph.put("type", "paragraph");
            ArrayNode pContent = objectMapper.createArrayNode();
            ObjectNode textNode = objectMapper.createObjectNode();
            textNode.put("type", "text");
            String descText = (issueDTO.getDescription() != null ? issueDTO.getDescription() : "Test execution failed") + "\n\n" +
                "Test Case: " + testCase.getTitle() + "\n" +
                "Test Run: " + testRun.getName() + "\n" +
                "Status: " + execution.getStatus() + "\n" +
                "Expected: " + testCase.getExpectedResult() + "\n" +
                "Actual: " + (execution.getActualResult() != null ? execution.getActualResult() : "Not specified");
            textNode.put("text", descText);
            pContent.add(textNode);
            paragraph.set("content", pContent);
            content.add(paragraph);
            descriptionADF.set("content", content);
            fields.set("description", descriptionADF);

            // Issue Type
            ObjectNode issueType = objectMapper.createObjectNode();
            issueType.put("name", issueDTO.getIssueType() != null ? issueDTO.getIssueType() : config.getDefaultIssueType());
            fields.set("issuetype", issueType);

            // Priority
            if (issueDTO.getPriority() != null || config.getDefaultPriority() != null) {
                ObjectNode priority = objectMapper.createObjectNode();
                priority.put("name", issueDTO.getPriority() != null ? issueDTO.getPriority() : config.getDefaultPriority());
                fields.set("priority", priority);
            }

            payload.set("fields", fields);

            // Make API call to JIRA
            String jiraApiUrl = config.getJiraUrl() + "/rest/api/3/issue";
            String decryptedToken = decryptApiToken(config.getJiraApiToken());
            String auth = config.getJiraUsername() + ":" + decryptedToken;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

            // Debug logging
            System.out.println("JIRA API URL: " + jiraApiUrl);
            System.out.println("JIRA Username: " + config.getJiraUsername());
            System.out.println("JIRA Project Key: " + config.getJiraProjectKey());
            System.out.println("Payload: " + payload.toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic " + encodedAuth);

            HttpEntity<String> request = new HttpEntity<>(payload.toString(), headers);

            try {
                ResponseEntity<String> response = restTemplate.postForEntity(jiraApiUrl, request, String.class);

                if (response.getStatusCode() == HttpStatus.CREATED || response.getStatusCode() == HttpStatus.OK) {
                    JsonNode responseJson = objectMapper.readTree(response.getBody());
                    String jiraKey = responseJson.get("key").asText();
                    String jiraUrl = config.getJiraUrl() + "/browse/" + jiraKey;

                    // Update test execution with JIRA reference
                    execution.setDefectReference(jiraKey);
                    testExecutionRepository.save(execution);

                    issueDTO.setJiraIssueKey(jiraKey);
                    issueDTO.setJiraIssueUrl(jiraUrl);
                    issueDTO.setStatus("Created");
                    return issueDTO;
                } else {
                    throw new RuntimeException("Failed to create JIRA issue: " + response.getStatusCode());
                }
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                System.out.println("JIRA API Error: " + e.getStatusCode());
                System.out.println("JIRA Error Response: " + e.getResponseBodyAsString());
                issueDTO.setStatus("Failed");
                issueDTO.setErrorMessage(e.getResponseBodyAsString());
                return issueDTO;
            }

        } catch (Exception e) {
            System.out.println("Exception creating JIRA issue: " + e.getMessage());
            e.printStackTrace();
            issueDTO.setStatus("Failed");
            issueDTO.setErrorMessage(e.getMessage());
            return issueDTO;
        }
    }

    private JiraConfigurationDTO convertToDTO(JiraConfiguration config) {
        JiraConfigurationDTO dto = new JiraConfigurationDTO();
        dto.setId(config.getId());
        dto.setProjectId(config.getProjectId());
        dto.setJiraUrl(config.getJiraUrl());
        dto.setJiraProjectKey(config.getJiraProjectKey());
        dto.setJiraUsername(config.getJiraUsername());
        dto.setJiraApiToken("***ENCRYPTED***"); // Mask the token
        dto.setDefaultIssueType(config.getDefaultIssueType());
        dto.setDefaultPriority(config.getDefaultPriority());
        dto.setEnableUserMapping(config.getEnableUserMapping());
        dto.setUserMappings(config.getUserMappings());
        dto.setIsEnabled(config.getIsEnabled());
        dto.setCreatedByUserId(config.getCreatedByUserId());
        dto.setCreatedAt(config.getCreatedAt());
        dto.setUpdatedAt(config.getUpdatedAt());

        // Set project name
        projectRepository.findById(config.getProjectId())
            .ifPresent(project -> dto.setProjectName(project.getName()));

        // Set creator username
        userRepository.findById(config.getCreatedByUserId())
            .ifPresent(user -> dto.setCreatedByUsername(user.getUsername()));

        return dto;
    }
}
