package com.testrium.manager.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "client")
public class ClientConfig {
    private String name;
    private String domain;
    private List<String> allowedEmailDomains;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public List<String> getAllowedEmailDomains() {
        return allowedEmailDomains;
    }

    public void setAllowedEmailDomains(List<String> allowedEmailDomains) {
        this.allowedEmailDomains = allowedEmailDomains;
    }

    public boolean isEmailDomainAllowed(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }
        String emailDomain = email.substring(email.lastIndexOf("@") + 1).toLowerCase();
        return allowedEmailDomains.stream()
                .anyMatch(allowed -> allowed.equalsIgnoreCase(emailDomain));
    }
}
