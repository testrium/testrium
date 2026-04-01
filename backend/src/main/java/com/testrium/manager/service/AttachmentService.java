package com.testrium.manager.service;

import com.testrium.manager.dto.AttachmentDTO;
import com.testrium.manager.entity.Attachment;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.AttachmentRepository;
import com.testrium.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    @Value("${testrium.upload.dir:./uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final List<String> ALLOWED_TYPES = List.of(
        "image/png", "image/jpeg", "image/gif", "image/webp",
        "application/pdf",
        "text/plain", "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/zip", "application/x-zip-compressed",
        "video/mp4", "video/webm"
    );

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<AttachmentDTO> getByExecutionId(Long executionId) {
        return attachmentRepository.findByTestExecutionIdOrderByCreatedAtDesc(executionId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AttachmentDTO upload(Long executionId, MultipartFile file, Long userId) throws IOException {
        if (file.isEmpty()) throw new RuntimeException("File is empty");
        if (file.getSize() > MAX_FILE_SIZE) throw new RuntimeException("File exceeds 10 MB limit");

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new RuntimeException("File type not allowed: " + contentType);
        }

        Path dir = Paths.get(uploadDir, "executions", String.valueOf(executionId));
        Files.createDirectories(dir);

        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String storedName = UUID.randomUUID().toString() + ext;
        Path dest = dir.resolve(storedName);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        Attachment attachment = new Attachment();
        attachment.setTestExecutionId(executionId);
        attachment.setFileName(storedName);
        attachment.setOriginalName(original != null ? original : storedName);
        attachment.setFileSize(file.getSize());
        attachment.setContentType(contentType);
        attachment.setFilePath(dest.toString());
        attachment.setUploadedByUserId(userId);

        return toDTO(attachmentRepository.save(attachment));
    }

    public Resource download(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        try {
            Path path = Paths.get(attachment.getFilePath());
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists()) throw new RuntimeException("File not found on disk");
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file", e);
        }
    }

    public Attachment getById(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    public void delete(Long id) throws IOException {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        Path path = Paths.get(attachment.getFilePath());
        Files.deleteIfExists(path);
        attachmentRepository.delete(attachment);
    }

    private AttachmentDTO toDTO(Attachment a) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(a.getId());
        dto.setTestExecutionId(a.getTestExecutionId());
        dto.setOriginalName(a.getOriginalName());
        dto.setFileSize(a.getFileSize());
        dto.setContentType(a.getContentType());
        dto.setCreatedAt(a.getCreatedAt());
        if (a.getUploadedByUserId() != null) {
            userRepository.findById(a.getUploadedByUserId())
                    .ifPresent(u -> dto.setUploadedByUsername(u.getUsername()));
        }
        return dto;
    }
}
