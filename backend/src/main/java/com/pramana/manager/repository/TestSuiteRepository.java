package com.pramana.manager.repository;

import com.pramana.manager.entity.TestSuite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestSuiteRepository extends JpaRepository<TestSuite, Long> {

    List<TestSuite> findByProjectId(Long projectId);

    long countByProjectId(Long projectId);
}
