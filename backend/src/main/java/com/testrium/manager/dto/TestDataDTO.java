// Copyright 2025-2026 Mohammad Saddam Hossain and the Testrium contributors
// SPDX-License-Identifier: Apache-2.0

package com.testrium.manager.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TestDataDTO {
    private Long id;
    private String name;
    private String description;
    private Long projectId;
    private String projectName;
    private String environment;
    private String dataType;
    private String dataContent;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
}
