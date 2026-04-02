package com.testrium.manager.controller;

import com.testrium.manager.entity.ProjectWebhookConfig;
import com.testrium.manager.service.WebhookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects/{projectId}/webhook-config")
@CrossOrigin(origins = "*")
public class ProjectWebhookConfigController {

    @Autowired
    private WebhookService webhookService;

    @GetMapping
    public ResponseEntity<?> getConfig(@PathVariable Long projectId) {
        Optional<ProjectWebhookConfig> opt = webhookService.getConfig(projectId);
        Map<String, Object> result = new HashMap<>();
        if (opt.isPresent()) {
            ProjectWebhookConfig c = opt.get();
            result.put("slackWebhookUrl", c.getSlackWebhookUrl() != null ? c.getSlackWebhookUrl() : "");
            result.put("teamsWebhookUrl", c.getTeamsWebhookUrl() != null ? c.getTeamsWebhookUrl() : "");
            result.put("notifyOnAssigned", c.getNotifyOnAssigned() != null ? c.getNotifyOnAssigned() : true);
            result.put("notifyOnCompleted", c.getNotifyOnCompleted() != null ? c.getNotifyOnCompleted() : true);
            result.put("enabled", c.getEnabled() != null ? c.getEnabled() : true);
        } else {
            result.put("slackWebhookUrl", "");
            result.put("teamsWebhookUrl", "");
            result.put("notifyOnAssigned", true);
            result.put("notifyOnCompleted", true);
            result.put("enabled", true);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping
    public ResponseEntity<?> saveConfig(@PathVariable Long projectId,
                                        @RequestBody Map<String, Object> body) {
        webhookService.saveConfig(
                projectId,
                (String) body.get("slackWebhookUrl"),
                (String) body.get("teamsWebhookUrl"),
                body.get("notifyOnAssigned") instanceof Boolean b ? b : Boolean.parseBoolean(String.valueOf(body.get("notifyOnAssigned"))),
                body.get("notifyOnCompleted") instanceof Boolean b ? b : Boolean.parseBoolean(String.valueOf(body.get("notifyOnCompleted"))),
                body.get("enabled") instanceof Boolean b ? b : Boolean.parseBoolean(String.valueOf(body.get("enabled")))
        );
        return ResponseEntity.ok(Map.of("message", "Webhook configuration saved"));
    }

    @PostMapping("/test")
    public ResponseEntity<?> testWebhook(@PathVariable Long projectId,
                                         @RequestBody Map<String, String> body) {
        String target = body.getOrDefault("target", "slack");
        try {
            webhookService.sendTestNotification(projectId, target);
            return ResponseEntity.ok(Map.of("message", "Test notification sent to " + target));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
