package com.testrium.manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TestriumApplication {
    public static void main(String[] args) {
        SpringApplication.run(TestriumApplication.class, args);
    }
}
