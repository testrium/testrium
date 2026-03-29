package com.testrium.manager.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.smtp.from}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Verify Your Email - Pramana Manager");

        String verificationLink = "http://localhost:5173/verify-email?token=" + token;

        message.setText("Hello,\n\n" +
                "Please verify your email address by clicking the link below:\n\n" +
                verificationLink + "\n\n" +
                "This link will expire in 5 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Pramana Manager Team");

        mailSender.send(message);
    }
}
