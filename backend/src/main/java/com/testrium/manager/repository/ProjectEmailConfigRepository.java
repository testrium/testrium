package com.testrium.manager.repository;

import com.testrium.manager.entity.ProjectEmailConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProjectEmailConfigRepository extends JpaRepository<ProjectEmailConfig, Long> {
    Optional<ProjectEmailConfig> findByProjectId(Long projectId);
}
