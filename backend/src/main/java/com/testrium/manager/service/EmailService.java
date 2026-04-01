package com.testrium.manager.service;

import com.testrium.manager.entity.ProjectEmailConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Properties;

@Service
public class EmailService {

    @Autowired
    private ProjectEmailConfigService projectEmailConfigService;

    private JavaMailSenderImpl buildSender(ProjectEmailConfig config) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(config.getSmtpHost());
        sender.setPort(Integer.parseInt(config.getSmtpPort() != null ? config.getSmtpPort() : "587"));
        sender.setUsername(config.getSmtpUsername());
        sender.setPassword(projectEmailConfigService.decryptPassword(config.getSmtpPassword()));

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true".equalsIgnoreCase(config.getTls()) ? "true" : "false");
        return sender;
    }

    private String resolveFrom(ProjectEmailConfig config) {
        String from = config.getFromAddress();
        return (from != null && !from.isBlank()) ? from : config.getSmtpUsername();
    }

    private boolean isConfigured(ProjectEmailConfig config) {
        return config.getEnabled() != null && config.getEnabled()
                && config.getSmtpUsername() != null && !config.getSmtpUsername().isBlank()
                && config.getSmtpPassword() != null && !config.getSmtpPassword().isBlank()
                && config.getSmtpHost() != null && !config.getSmtpHost().isBlank();
    }

    @Async
    public void sendAsync(Long projectId, String to, String subject, String body) {
        Optional<ProjectEmailConfig> opt = projectEmailConfigService.getConfigEntity(projectId);
        if (opt.isEmpty() || !isConfigured(opt.get())) return;
        ProjectEmailConfig config = opt.get();
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(resolveFrom(config));
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            buildSender(config).send(message);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send to " + to + ": " + e.getMessage());
        }
    }

    public void sendTestRunAssigned(String toEmail, String assigneeName, String runName,
                                    String projectName, Long runId, Long projectId) {
        String body = "Hi " + assigneeName + ",\n\n" +
                "A test run has been assigned to you:\n\n" +
                "  Run:     " + runName + "\n" +
                "  Project: " + projectName + "\n\n" +
                "Log in to Testrium to start executing tests.\n\nBest regards,\nTestrium";
        sendAsync(projectId, toEmail, "[Testrium] Test Run Assigned: " + runName, body);
    }

    public void sendTestRunCompleted(String toEmail, String recipientName, String runName,
                                     String projectName, int passed, int failed, int total, Long projectId) {
        String body = "Hi " + recipientName + ",\n\n" +
                "A test run has been completed:\n\n" +
                "  Run:     " + runName + "\n" +
                "  Project: " + projectName + "\n\n" +
                "Results:\n" +
                "  Passed:  " + passed + " / " + total + "\n" +
                "  Failed:  " + failed + " / " + total + "\n\n" +
                "Log in to Testrium to view the full report.\n\nBest regards,\nTestrium";
        sendAsync(projectId, toEmail, "[Testrium] Test Run Completed: " + runName, body);
    }

    /**
     * Sends a verification email using any available project SMTP config.
     * Silently skips if none are configured.
     */
    public void sendVerificationEmail(String toEmail, String token) {
        projectEmailConfigService.findFirstConfigured().ifPresent(config -> {
            if (!isConfigured(config)) return;
            try {
                String link = "http://localhost:5173/verify-email?token=" + token;
                String body = "Hello,\n\nPlease verify your email:\n\n" + link +
                        "\n\nThis link expires in 5 minutes.\n\nBest regards,\nTestrium";
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(resolveFrom(config));
                message.setTo(toEmail);
                message.setSubject("Verify Your Email - Testrium");
                message.setText(body);
                buildSender(config).send(message);
            } catch (Exception e) {
                System.err.println("[EmailService] Failed to send verification to " + toEmail + ": " + e.getMessage());
            }
        });
    }

    public void sendTestEmailForProject(Long projectId, String toEmail) {
        Optional<ProjectEmailConfig> opt = projectEmailConfigService.getConfigEntity(projectId);
        if (opt.isEmpty() || !isConfigured(opt.get()))
            throw new RuntimeException("Email is not configured for this project");
        ProjectEmailConfig config = opt.get();
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(resolveFrom(config));
            message.setTo(toEmail);
            message.setSubject("[Testrium] Test Email");
            message.setText("Hi,\n\nThis is a test email from Testrium.\n\n" +
                    "Your email notifications are configured correctly.\n\nBest regards,\nTestrium");
            buildSender(config).send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send test email: " + e.getMessage(), e);
        }
    }
}
