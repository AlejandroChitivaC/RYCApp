package com.rycapp.infrastructure.security;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class OtpGenerator {
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Código numérico de {@code digits} dígitos usando {@link SecureRandom}.
     */
    public String generateNumericOtp(int digits) {
        if (digits < 4 || digits > 10) {
            throw new IllegalArgumentException("digits debe estar entre 4 y 10");
        }
        int bound = (int) Math.pow(10, digits);
        int n = secureRandom.nextInt(bound);
        return String.format("%0" + digits + "d", n);
    }
}
