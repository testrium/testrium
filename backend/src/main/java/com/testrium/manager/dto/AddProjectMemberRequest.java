// Copyright 2025-2026 Mohammad Saddam Hossain and the Testrium contributors
// SPDX-License-Identifier: Apache-2.0

package com.testrium.manager.dto;

import java.util.List;

public class AddProjectMemberRequest {
    private List<Long> userIds;
    private String role = "MEMBER";

    public List<Long> getUserIds() { return userIds; }
    public void setUserIds(List<Long> userIds) { this.userIds = userIds; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
