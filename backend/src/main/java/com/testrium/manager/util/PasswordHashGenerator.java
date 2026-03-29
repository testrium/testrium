package com.testrium.manager.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate BCrypt password hashes
 * Run this class to generate password hash for admin user
 */
public class PasswordHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Generate hash for admin password: admin123
        String password = "admin123";
        String hashedPassword = encoder.encode(password);

        System.out.println("======================================");
        System.out.println("Password Hash Generator");
        System.out.println("======================================");
        System.out.println("Plain Password: " + password);
        System.out.println("Hashed Password: " + hashedPassword);
        System.out.println("======================================");
        System.out.println("\nUse this hash in your SQL script or database");
    }
}
