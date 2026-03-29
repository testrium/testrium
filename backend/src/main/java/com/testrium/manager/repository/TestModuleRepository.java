package com.testrium.manager.repository;

import com.testrium.manager.entity.TestModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestModuleRepository extends JpaRepository<TestModule, Long> {

    List<TestModule> findByProjectId(Long projectId);

    long countByProjectId(Long projectId);
}
