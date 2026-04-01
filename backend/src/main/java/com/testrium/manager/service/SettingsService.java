package com.testrium.manager.service;

import com.testrium.manager.entity.SystemSetting;
import com.testrium.manager.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class SettingsService {

    private static final String SMTP_HOST     = "smtp.host";
    private static final String SMTP_PORT     = "smtp.port";
    private static final String SMTP_USERNAME = "smtp.username";
    private static final String SMTP_PASSWORD = "smtp.password";
    private static final String SMTP_FROM     = "smtp.from";
    private static final String SMTP_TLS      = "smtp.tls";

    @Value("${jira.encryption.key:TestriumJiraKey1}")
    private String encryptionKey;

    @Autowired
    private SystemSettingRepository repo;

    public Map<String, String> getEmailSettings() {
        Map<String, String> settings = new HashMap<>();
        settings.put("host",     get(SMTP_HOST, "smtp.gmail.com"));
        settings.put("port",     get(SMTP_PORT, "587"));
        settings.put("username", get(SMTP_USERNAME, ""));
        settings.put("from",     get(SMTP_FROM, ""));
        settings.put("tls",      get(SMTP_TLS, "true"));
        // Never return the actual password — just indicate if one is saved
        String pwd = get(SMTP_PASSWORD, "");
        settings.put("passwordSaved", pwd.isEmpty() ? "false" : "true");
        return settings;
    }

    public void saveEmailSettings(String host, String port, String username,
                                  String password, String from, String tls) {
        set(SMTP_HOST, host);
        set(SMTP_PORT, port != null ? port : "587");
        set(SMTP_USERNAME, username);
        set(SMTP_FROM, from != null ? from : username);
        set(SMTP_TLS, tls != null ? tls : "true");
        if (password != null && !password.isBlank()) {
            set(SMTP_PASSWORD, encrypt(password));
        }
    }

    public String getSmtpHost()     { return get(SMTP_HOST, ""); }
    public int    getSmtpPort()     { return Integer.parseInt(get(SMTP_PORT, "587")); }
    public String getSmtpUsername() { return get(SMTP_USERNAME, ""); }
    public String getSmtpFrom()     { String f = get(SMTP_FROM, ""); return f.isBlank() ? getSmtpUsername() : f; }
    public boolean isSmtpTls()      { return "true".equalsIgnoreCase(get(SMTP_TLS, "true")); }
    public boolean isConfigured()   { return !getSmtpUsername().isBlank() && !get(SMTP_PASSWORD, "").isBlank(); }

    public String getSmtpPassword() {
        String enc = get(SMTP_PASSWORD, "");
        if (enc.isBlank()) return "";
        try { return decrypt(enc); } catch (Exception e) { return ""; }
    }

    private String get(String key, String defaultVal) {
        return repo.findById(key).map(SystemSetting::getValue).orElse(defaultVal);
    }

    private void set(String key, String value) {
        repo.save(new SystemSetting(key, value != null ? value : ""));
    }

    private String encrypt(String plain) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(encryptionKey.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            return Base64.getEncoder().encodeToString(cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    private String decrypt(String encrypted) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(encryptionKey.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            return new String(cipher.doFinal(Base64.getDecoder().decode(encrypted)), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }
}
