package com.testrium.manager.controller;

import com.testrium.manager.dto.AutomationCommentDTO;
import com.testrium.manager.service.AutomationCommentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/automation-comments")
@CrossOrigin(origins = "*")
public class AutomationCommentController {

    private final AutomationCommentService automationCommentService;

    public AutomationCommentController(AutomationCommentService automationCommentService) {
        this.automationCommentService = automationCommentService;
    }

    @PostMapping
    public ResponseEntity<AutomationCommentDTO> addComment(
            @Valid @RequestBody AutomationCommentDTO dto,
            @RequestParam Long userId) {
        return ResponseEntity.ok(automationCommentService.addComment(dto, userId));
    }

    @GetMapping("/current/{testCaseId}")
    public ResponseEntity<AutomationCommentDTO> getCurrentComment(@PathVariable Long testCaseId) {
        return automationCommentService.getCurrentComment(testCaseId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history/{testCaseId}")
    public ResponseEntity<List<AutomationCommentDTO>> getCommentHistory(@PathVariable Long testCaseId) {
        return ResponseEntity.ok(automationCommentService.getCommentHistory(testCaseId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        automationCommentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
