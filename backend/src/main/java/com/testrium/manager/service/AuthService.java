package com.testrium.manager.service;

import com.testrium.manager.config.ClientConfig;
import com.testrium.manager.dto.*;
import com.testrium.manager.entity.TokenBlacklist;
import com.testrium.manager.entity.User;
import com.testrium.manager.repository.TokenBlacklistRepository;
import com.testrium.manager.repository.UserRepository;
import com.testrium.manager.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final EmailVerificationService emailVerificationService;
    private final ClientConfig clientConfig;

    @Value("${registration.email.verification.required:false}")
    private boolean emailVerificationRequired;

    public AuthService(UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      JwtUtil jwtUtil,
                      TokenBlacklistRepository tokenBlacklistRepository,
                      EmailVerificationService emailVerificationService,
                      ClientConfig clientConfig) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistRepository = tokenBlacklistRepository;
        this.emailVerificationService = emailVerificationService;
        this.clientConfig = clientConfig;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setEmailVerified(true);

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, toUserDTO(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(token, toUserDTO(user));
    }

    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toUserDTO(user);
    }

    public void logout(String token) {
        TokenBlacklist blacklistedToken = new TokenBlacklist(
            token,
            jwtUtil.getExpirationFromToken(token)
        );
        tokenBlacklistRepository.save(blacklistedToken);
    }

    public boolean isTokenBlacklisted(String token) {
        return tokenBlacklistRepository.existsByToken(token);
    }

    public boolean verifyEmail(String token) {
        boolean verified = emailVerificationService.verifyToken(token);
        if (verified) {
            String email = emailVerificationService.getEmailByToken(token);
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setEmailVerified(true);
                userRepository.save(user);
            });
        }
        return verified;
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }
        emailVerificationService.createVerificationToken(email);
    }

    private UserDTO toUserDTO(User user) {
        return new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}
