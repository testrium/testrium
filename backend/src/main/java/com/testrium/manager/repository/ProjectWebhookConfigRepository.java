// Copyright 2025-2026 Mohammad Saddam Hossain and the Testrium contributors
// SPDX-License-Identifier: Apache-2.0

package com.testrium.manager.repository;

import com.testrium.manager.entity.ProjectWebhookConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProjectWebhookConfigRepository extends JpaRepository<ProjectWebhookConfig, Long> {
    Optional<ProjectWebhookConfig> findByProjectId(Long projectId);
}
