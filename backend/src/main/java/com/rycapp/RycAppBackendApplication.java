package com.rycapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RycAppBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(RycAppBackendApplication.class, args);
    }
}

