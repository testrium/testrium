package com.pramana.manager.repository;

import com.pramana.manager.entity.TestCaseData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseDataRepository extends JpaRepository<TestCaseData, Long> {
    List<TestCaseData> findByTestCaseIdOrderByOrderIndex(Long testCaseId);
    List<TestCaseData> findByTestDataId(Long testDataId);
    void deleteByTestCaseIdAndTestDataId(Long testCaseId, Long testDataId);
}
