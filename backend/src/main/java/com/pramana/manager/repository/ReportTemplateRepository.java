package com.pramana.manager.repository;

import com.pramana.manager.entity.ReportTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportTemplateRepository extends JpaRepository<ReportTemplate, Long> {
    List<ReportTemplate> findByCreatedByUserId(Long userId);
    List<ReportTemplate> findByProjectId(Long projectId);
}
