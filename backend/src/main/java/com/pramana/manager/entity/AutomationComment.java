package com.pramana.manager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "automation_comments")
public class AutomationComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id", nullable = false)
    private TestCase testCase;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_current", nullable = false)
    private Boolean isCurrent = true;

    // Optional: Add status field to track automation feasibility
    @Enumerated(EnumType.STRING)
    @Column(name = "automation_status")
    private AutomationStatus automationStatus;

    public enum AutomationStatus {
        NOT_FEASIBLE,           // Cannot be automated
        REQUIRES_MANUAL,        // Must remain manual
        BLOCKED,                // Blocked by technical limitations
        PENDING_TOOLING,        // Waiting for tools/infrastructure
        PLANNED,                // Planned for automation
        IN_PROGRESS,            // Automation work in progress
        DEFERRED                // Deferred to future sprint
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public AutomationComment() {
    }

    public AutomationComment(TestCase testCase, String comment, User createdBy) {
        this.testCase = testCase;
        this.comment = comment;
        this.createdBy = createdBy;
        this.isCurrent = true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TestCase getTestCase() {
        return testCase;
    }

    public void setTestCase(TestCase testCase) {
        this.testCase = testCase;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsCurrent() {
        return isCurrent;
    }

    public void setIsCurrent(Boolean isCurrent) {
        this.isCurrent = isCurrent;
    }

    public AutomationStatus getAutomationStatus() {
        return automationStatus;
    }

    public void setAutomationStatus(AutomationStatus automationStatus) {
        this.automationStatus = automationStatus;
    }
}
