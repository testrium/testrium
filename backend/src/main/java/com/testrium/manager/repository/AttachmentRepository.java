package com.testrium.manager.repository;

import com.testrium.manager.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTestExecutionIdOrderByCreatedAtDesc(Long testExecutionId);
    void deleteByTestExecutionId(Long testExecutionId);
}
