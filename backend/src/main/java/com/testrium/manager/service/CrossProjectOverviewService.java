package com.testrium.manager.service;

import com.testrium.manager.dto.CrossProjectOverviewDTO;
import com.testrium.manager.entity.Project;
import com.testrium.manager.entity.TestCase;
import com.testrium.manager.entity.TestRun;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CrossProjectOverviewService {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private TestCaseRepository testCaseRepository;
    @Autowired private TestRunRepository testRunRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public CrossProjectOverviewDTO getOverview(User currentUser) {
        CrossProjectOverviewDTO dto = new CrossProjectOverviewDTO();

        // Admins see all projects; others see only their member projects
        List<Project> allProjects;
        if ("ADMIN".equals(currentUser.getRole())) {
            allProjects = projectRepository.findAll();
        } else {
            Set<Long> memberProjectIds = projectMemberRepository.findByUserId(currentUser.getId())
                    .stream().map(m -> m.getProjectId()).collect(Collectors.toSet());
            allProjects = projectRepository.findAll().stream()
                    .filter(p -> memberProjectIds.contains(p.getId()))
                    .collect(Collectors.toList());
        }

        Set<Long> visibleProjectIds = allProjects.stream().map(Project::getId).collect(Collectors.toSet());

        List<TestCase> allCases = testCaseRepository.findAll().stream()
                .filter(c -> visibleProjectIds.contains(c.getProject().getId()))
                .collect(Collectors.toList());
        List<TestRun> allRuns = testRunRepository.findAll().stream()
                .filter(r -> visibleProjectIds.contains(r.getProjectId()))
                .collect(Collectors.toList());

        // Global KPIs
        dto.setTotalProjects(allProjects.size());
        dto.setTotalTestCases(allCases.size());
        dto.setTotalTestRuns(allRuns.size());
        // Count unique members across visible projects
        long memberCount = "ADMIN".equals(currentUser.getRole())
                ? userRepository.count()
                : projectMemberRepository.findAll().stream()
                    .filter(m -> visibleProjectIds.contains(m.getProjectId()))
                    .map(m -> m.getUserId()).distinct().count();
        dto.setTotalUsers((int) memberCount);

        // Test run status counts
        long passed     = allRuns.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();
        long failed     = allRuns.stream().filter(r -> "FAILED".equals(r.getStatus())).count();
        long inProgress = allRuns.stream().filter(r -> "IN_PROGRESS".equals(r.getStatus())).count();
        long notStarted = allRuns.stream().filter(r -> "NOT_STARTED".equals(r.getStatus())).count();
        dto.setRunsPassed((int) passed);
        dto.setRunsFailed((int) failed);
        dto.setRunsInProgress((int) inProgress);
        dto.setRunsNotStarted((int) notStarted);

        long completedOrFailed = passed + failed;
        dto.setOverallPassRate(completedOrFailed > 0
                ? Math.round((double) passed / completedOrFailed * 1000.0) / 10.0
                : 0.0);

        // Priority breakdown
        dto.setPriorityLow((int) allCases.stream().filter(c -> c.getPriority() == TestCase.Priority.LOW).count());
        dto.setPriorityMedium((int) allCases.stream().filter(c -> c.getPriority() == TestCase.Priority.MEDIUM).count());
        dto.setPriorityHigh((int) allCases.stream().filter(c -> c.getPriority() == TestCase.Priority.HIGH).count());
        dto.setPriorityCritical((int) allCases.stream().filter(c -> c.getPriority() == TestCase.Priority.CRITICAL).count());

        // Automation breakdown
        dto.setAutomatedCases((int) allCases.stream().filter(c -> Boolean.TRUE.equals(c.getIsAutomated())).count());
        dto.setManualCases((int) allCases.stream().filter(c -> !Boolean.TRUE.equals(c.getIsAutomated())).count());

        // Per-project summaries
        Map<Long, List<TestCase>> casesByProject = allCases.stream()
                .collect(Collectors.groupingBy(c -> c.getProject().getId()));
        Map<Long, List<TestRun>> runsByProject = allRuns.stream()
                .collect(Collectors.groupingBy(TestRun::getProjectId));

        List<CrossProjectOverviewDTO.ProjectSummary> summaries = allProjects.stream().map(p -> {
            CrossProjectOverviewDTO.ProjectSummary s = new CrossProjectOverviewDTO.ProjectSummary();
            s.setProjectId(p.getId());
            s.setProjectName(p.getName());
            s.setProjectStatus(p.getStatus());

            List<TestCase> cases = casesByProject.getOrDefault(p.getId(), List.of());
            s.setTestCaseCount(cases.size());

            List<TestRun> runs = runsByProject.getOrDefault(p.getId(), List.of());
            s.setTestRunCount(runs.size());

            int pPassed = (int) runs.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();
            int pFailed = (int) runs.stream().filter(r -> "FAILED".equals(r.getStatus())).count();
            int pInProg = (int) runs.stream().filter(r -> "IN_PROGRESS".equals(r.getStatus())).count();
            s.setPassedRuns(pPassed);
            s.setFailedRuns(pFailed);
            s.setInProgressRuns(pInProg);

            long pFinished = pPassed + pFailed;
            s.setPassRate(pFinished > 0 ? Math.round((double) pPassed / pFinished * 1000.0) / 10.0 : 0.0);
            return s;
        }).sorted(Comparator.comparing(CrossProjectOverviewDTO.ProjectSummary::getTestCaseCount).reversed())
          .collect(Collectors.toList());
        dto.setProjects(summaries);

        // Recent runs (last 10 by createdAt)
        List<CrossProjectOverviewDTO.RecentRun> recentRuns = allRuns.stream()
                .filter(r -> r.getCreatedAt() != null)
                .sorted(Comparator.comparing(TestRun::getCreatedAt).reversed())
                .limit(10)
                .map(r -> {
                    CrossProjectOverviewDTO.RecentRun rr = new CrossProjectOverviewDTO.RecentRun();
                    rr.setRunId(r.getId());
                    rr.setRunName(r.getName());
                    rr.setStatus(r.getStatus());
                    rr.setCreatedAt(r.getCreatedAt().format(FMT));
                    allProjects.stream().filter(p -> p.getId().equals(r.getProjectId()))
                            .findFirst().ifPresent(p -> rr.setProjectName(p.getName()));
                    if (r.getAssignedToUserId() != null) {
                        userRepository.findById(r.getAssignedToUserId())
                                .ifPresent(u -> rr.setAssignedTo(u.getUsername()));
                    }
                    return rr;
                }).collect(Collectors.toList());
        dto.setRecentRuns(recentRuns);

        return dto;
    }
}
