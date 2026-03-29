package com.testrium.manager.service;

import com.testrium.manager.entity.EmailVerificationToken;
import com.testrium.manager.repository.EmailVerificationTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;

    @Value("${registration.email.verification.timeout.minutes:5}")
    private int verificationTimeoutMinutes;

    public EmailVerificationService(EmailVerificationTokenRepository tokenRepository,
                                   EmailService emailService) {
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }

    public String createVerificationToken(String email) {
        // Delete old tokens for this email
        tokenRepository.findByEmail(email).ifPresent(tokenRepository::delete);

        // Create new token
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setEmail(email);
        verificationToken.setExpiryDate(LocalDateTime.now().plusMinutes(verificationTimeoutMinutes));
        verificationToken.setUsed(false);

        tokenRepository.save(verificationToken);

        // Send email
        emailService.sendVerificationEmail(email, token);

        return token;
    }

    public boolean verifyToken(String token) {
        return tokenRepository.findByToken(token)
                .map(verificationToken -> {
                    if (verificationToken.isUsed()) {
                        return false;
                    }
                    if (verificationToken.isExpired()) {
                        return false;
                    }
                    verificationToken.setUsed(true);
                    tokenRepository.save(verificationToken);
                    return true;
                })
                .orElse(false);
    }

    public String getEmailByToken(String token) {
        return tokenRepository.findByToken(token)
                .map(EmailVerificationToken::getEmail)
                .orElse(null);
    }
}
