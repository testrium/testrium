package com.testrium.manager.service;

import com.testrium.manager.dto.AutomationCommentDTO;
import com.testrium.manager.entity.AutomationComment;
import com.testrium.manager.entity.TestCase;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.AutomationCommentRepository;
import com.testrium.manager.repository.TestCaseRepository;
import com.testrium.manager.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AutomationCommentService {

    private final AutomationCommentRepository automationCommentRepository;
    private final TestCaseRepository testCaseRepository;
    private final UserRepository userRepository;

    public AutomationCommentService(
            AutomationCommentRepository automationCommentRepository,
            TestCaseRepository testCaseRepository,
            UserRepository userRepository) {
        this.automationCommentRepository = automationCommentRepository;
        this.testCaseRepository = testCaseRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AutomationCommentDTO addComment(AutomationCommentDTO dto, Long userId) {
        TestCase testCase = testCaseRepository.findById(dto.getTestCaseId())
                .orElseThrow(() -> new RuntimeException("Test case not found with id: " + dto.getTestCaseId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Mark all existing comments as historical
        automationCommentRepository.markAllAsHistorical(dto.getTestCaseId());

        // Create new comment
        AutomationComment comment = new AutomationComment(testCase, dto.getComment(), user);
        comment.setAutomationStatus(dto.getAutomationStatus());
        comment.setIsCurrent(true);

        AutomationComment saved = automationCommentRepository.save(comment);
        return convertToDTO(saved);
    }

    @Transactional(readOnly = true)
    public Optional<AutomationCommentDTO> getCurrentComment(Long testCaseId) {
        return automationCommentRepository.findByTestCaseIdAndIsCurrentTrue(testCaseId)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<AutomationCommentDTO> getCommentHistory(Long testCaseId) {
        return automationCommentRepository.findByTestCaseIdOrderByCreatedAtDesc(testCaseId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId) {
        automationCommentRepository.deleteById(commentId);
    }

    private AutomationCommentDTO convertToDTO(AutomationComment comment) {
        AutomationCommentDTO dto = new AutomationCommentDTO();
        dto.setId(comment.getId());
        dto.setTestCaseId(comment.getTestCase().getId());
        dto.setComment(comment.getComment());
        dto.setAutomationStatus(comment.getAutomationStatus());
        dto.setCreatedById(comment.getCreatedBy().getId());
        dto.setCreatedByUsername(comment.getCreatedBy().getUsername());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setIsCurrent(comment.getIsCurrent());
        return dto;
    }
}
