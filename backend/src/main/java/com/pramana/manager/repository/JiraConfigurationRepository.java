package com.pramana.manager.repository;

import com.pramana.manager.entity.JiraConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JiraConfigurationRepository extends JpaRepository<JiraConfiguration, Long> {
    Optional<JiraConfiguration> findByProjectId(Long projectId);
    boolean existsByProjectId(Long projectId);
}
