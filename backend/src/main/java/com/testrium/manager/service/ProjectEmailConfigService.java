package com.testrium.manager.service;

import com.testrium.manager.entity.ProjectEmailConfig;
import com.testrium.manager.repository.ProjectEmailConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ProjectEmailConfigService {

    @Value("${jira.encryption.key:TestriumJiraKey1}")
    private String encryptionKey;

    @Autowired
    private ProjectEmailConfigRepository repo;

    public Map<String, Object> getConfig(Long projectId) {
        Optional<ProjectEmailConfig> opt = repo.findByProjectId(projectId);
        Map<String, Object> result = new HashMap<>();
        if (opt.isPresent()) {
            ProjectEmailConfig c = opt.get();
            result.put("id", c.getId());
            result.put("smtpHost", c.getSmtpHost() != null ? c.getSmtpHost() : "");
            result.put("smtpPort", c.getSmtpPort() != null ? c.getSmtpPort() : "587");
            result.put("smtpUsername", c.getSmtpUsername() != null ? c.getSmtpUsername() : "");
            result.put("fromAddress", c.getFromAddress() != null ? c.getFromAddress() : "");
            result.put("tls", c.getTls() != null ? c.getTls() : "true");
            result.put("enabled", c.getEnabled() != null ? c.getEnabled() : true);
            String pwd = c.getSmtpPassword();
            result.put("passwordSaved", pwd != null && !pwd.isBlank());
        } else {
            result.put("smtpHost", "");
            result.put("smtpPort", "587");
            result.put("smtpUsername", "");
            result.put("fromAddress", "");
            result.put("tls", "true");
            result.put("enabled", true);
            result.put("passwordSaved", false);
        }
        return result;
    }

    public void saveConfig(Long projectId, String host, String port, String username,
                           String password, String from, String tls, Boolean enabled) {
        ProjectEmailConfig config = repo.findByProjectId(projectId)
                .orElseGet(() -> { ProjectEmailConfig c = new ProjectEmailConfig(); c.setProjectId(projectId); return c; });

        config.setSmtpHost(host != null ? host : "");
        config.setSmtpPort(port != null ? port : "587");
        config.setSmtpUsername(username != null ? username : "");
        config.setFromAddress(from != null && !from.isBlank() ? from : username);
        config.setTls(tls != null ? tls : "true");
        config.setEnabled(enabled != null ? enabled : true);
        if (password != null && !password.isBlank()) {
            config.setSmtpPassword(encrypt(password));
        }
        repo.save(config);
    }

    public Optional<ProjectEmailConfig> getConfigEntity(Long projectId) {
        return repo.findByProjectId(projectId);
    }

    public Optional<ProjectEmailConfig> findFirstConfigured() {
        return repo.findAll().stream()
                .filter(c -> c.getEnabled() != null && c.getEnabled()
                        && c.getSmtpUsername() != null && !c.getSmtpUsername().isBlank()
                        && c.getSmtpPassword() != null && !c.getSmtpPassword().isBlank()
                        && c.getSmtpHost() != null && !c.getSmtpHost().isBlank())
                .findFirst();
    }

    public String decryptPassword(String encrypted) {
        if (encrypted == null || encrypted.isBlank()) return "";
        try {
            SecretKeySpec key = new SecretKeySpec(encryptionKey.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, key);
            return new String(cipher.doFinal(Base64.getDecoder().decode(encrypted)), StandardCharsets.UTF_8);
        } catch (Exception e) { return ""; }
    }

    private String encrypt(String plain) {
        try {
            SecretKeySpec key = new SecretKeySpec(encryptionKey.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, key);
            return Base64.getEncoder().encodeToString(cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) { throw new RuntimeException("Encryption failed", e); }
    }
}
