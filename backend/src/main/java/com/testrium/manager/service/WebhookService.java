package com.testrium.manager.service;

import com.testrium.manager.entity.ProjectWebhookConfig;
import com.testrium.manager.repository.ProjectWebhookConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Service
public class WebhookService {

    @Autowired
    private ProjectWebhookConfigRepository repo;

    private final RestTemplate restTemplate = new RestTemplate();

    // ── Slack payload ────────────────────────────────────────────────────────
    private String slackPayload(String title, String text, String color) {
        return "{"
            + "\"attachments\":[{"
            + "\"color\":\"" + color + "\","
            + "\"title\":\"" + escapeJson(title) + "\","
            + "\"text\":\"" + escapeJson(text) + "\""
            + "}]}";
    }

    // ── Teams (MessageCard) payload ──────────────────────────────────────────
    private String teamsPayload(String title, String text, String themeColor) {
        return "{"
            + "\"@type\":\"MessageCard\","
            + "\"@context\":\"http://schema.org/extensions\","
            + "\"themeColor\":\"" + themeColor + "\","
            + "\"summary\":\"" + escapeJson(title) + "\","
            + "\"sections\":[{"
            + "\"activityTitle\":\"" + escapeJson(title) + "\","
            + "\"activityText\":\"" + escapeJson(text) + "\""
            + "}]}";
    }

    private void post(String url, String json) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        restTemplate.postForEntity(url, new HttpEntity<>(json, headers), String.class);
    }

    @Async
    public void sendAsync(Long projectId, String title, String text, String color, String teamsColor, boolean onAssigned, boolean onCompleted, boolean isAssignedEvent) {
        Optional<ProjectWebhookConfig> opt = repo.findByProjectId(projectId);
        if (opt.isEmpty()) return;
        ProjectWebhookConfig cfg = opt.get();
        if (!Boolean.TRUE.equals(cfg.getEnabled())) return;
        if (isAssignedEvent && !Boolean.TRUE.equals(cfg.getNotifyOnAssigned())) return;
        if (!isAssignedEvent && !Boolean.TRUE.equals(cfg.getNotifyOnCompleted())) return;

        if (cfg.getSlackWebhookUrl() != null && !cfg.getSlackWebhookUrl().isBlank()) {
            try { post(cfg.getSlackWebhookUrl(), slackPayload(title, text, color)); }
            catch (Exception e) { System.err.println("[Webhook] Slack failed: " + e.getMessage()); }
        }
        if (cfg.getTeamsWebhookUrl() != null && !cfg.getTeamsWebhookUrl().isBlank()) {
            try { post(cfg.getTeamsWebhookUrl(), teamsPayload(title, text, teamsColor)); }
            catch (Exception e) { System.err.println("[Webhook] Teams failed: " + e.getMessage()); }
        }
    }

    public void notifyTestRunAssigned(Long projectId, String runName, String projectName, String assigneeName) {
        String title = "Test Run Assigned: " + runName;
        String text  = "Project: *" + projectName + "*\nAssigned to: " + assigneeName;
        sendAsync(projectId, title, text, "#3b82f6", "3b82f6", true, false, true);
    }

    public void notifyTestRunCompleted(Long projectId, String runName, String projectName, int passed, int failed, int total) {
        String color = failed == 0 ? "#22c55e" : "#ef4444";
        String teamsColor = failed == 0 ? "22c55e" : "ef4444";
        String title = "Test Run Completed: " + runName;
        String text  = "Project: *" + projectName + "*\n"
                + "✅ Passed: " + passed + "/" + total + "  "
                + "❌ Failed: " + failed + "/" + total;
        sendAsync(projectId, title, text, color, teamsColor, false, true, false);
    }

    public void sendTestNotification(Long projectId, String target) throws Exception {
        Optional<ProjectWebhookConfig> opt = repo.findByProjectId(projectId);
        if (opt.isEmpty() || !Boolean.TRUE.equals(opt.get().getEnabled()))
            throw new RuntimeException("Webhook not configured or disabled for this project");
        ProjectWebhookConfig cfg = opt.get();
        boolean hasSlack = cfg.getSlackWebhookUrl() != null && !cfg.getSlackWebhookUrl().isBlank();
        boolean hasTeams = cfg.getTeamsWebhookUrl() != null && !cfg.getTeamsWebhookUrl().isBlank();
        if (!hasSlack && !hasTeams)
            throw new RuntimeException("No webhook URL configured");

        String title = "Testrium Test Notification";
        String text  = "Your webhook integration is working correctly.";
        if ("slack".equalsIgnoreCase(target) && hasSlack)
            post(cfg.getSlackWebhookUrl(), slackPayload(title, text, "#6366f1"));
        else if ("teams".equalsIgnoreCase(target) && hasTeams)
            post(cfg.getTeamsWebhookUrl(), teamsPayload(title, text, "6366f1"));
        else if (hasSlack)
            post(cfg.getSlackWebhookUrl(), slackPayload(title, text, "#6366f1"));
        else
            post(cfg.getTeamsWebhookUrl(), teamsPayload(title, text, "6366f1"));
    }

    public Optional<ProjectWebhookConfig> getConfig(Long projectId) {
        return repo.findByProjectId(projectId);
    }

    public void saveConfig(Long projectId, String slackUrl, String teamsUrl,
                           Boolean notifyOnAssigned, Boolean notifyOnCompleted, Boolean enabled) {
        ProjectWebhookConfig cfg = repo.findByProjectId(projectId)
                .orElseGet(() -> { ProjectWebhookConfig c = new ProjectWebhookConfig(); c.setProjectId(projectId); return c; });
        cfg.setSlackWebhookUrl(slackUrl != null && !slackUrl.isBlank() ? slackUrl.trim() : null);
        cfg.setTeamsWebhookUrl(teamsUrl != null && !teamsUrl.isBlank() ? teamsUrl.trim() : null);
        cfg.setNotifyOnAssigned(notifyOnAssigned != null ? notifyOnAssigned : true);
        cfg.setNotifyOnCompleted(notifyOnCompleted != null ? notifyOnCompleted : true);
        cfg.setEnabled(enabled != null ? enabled : true);
        repo.save(cfg);
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "");
    }
}
