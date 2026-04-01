package com.testrium.manager.controller;

import com.testrium.manager.dto.AttachmentDTO;
import com.testrium.manager.entity.Attachment;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.UserRepository;
import com.testrium.manager.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = "*")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<AttachmentDTO>> getByExecution(@RequestParam Long executionId) {
        return ResponseEntity.ok(attachmentService.getByExecutionId(executionId));
    }

    @PostMapping
    public ResponseEntity<?> upload(
            @RequestParam Long executionId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            AttachmentDTO dto = attachmentService.upload(executionId, file, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        try {
            Attachment attachment = attachmentService.getById(id);
            Resource resource = attachmentService.download(id);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(attachment.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + attachment.getOriginalName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            attachmentService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Attachment deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
