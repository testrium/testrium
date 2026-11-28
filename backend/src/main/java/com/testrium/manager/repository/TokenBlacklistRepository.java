// Copyright 2025-2026 Mohammad Saddam Hossain and the Testrium contributors
// SPDX-License-Identifier: Apache-2.0

package com.testrium.manager.repository;

import com.testrium.manager.entity.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, Long> {
    boolean existsByToken(String token);
}
