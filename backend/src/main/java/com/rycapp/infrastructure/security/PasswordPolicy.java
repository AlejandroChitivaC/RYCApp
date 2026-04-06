package com.rycapp.infrastructure.security;

import com.rycapp.application.exception.WeakPasswordException;

import java.util.regex.Pattern;

/**
 * Contraseña: mínimo 8 caracteres, al menos un dígito y un carácter especial (no alfanumérico).
 */
public final class PasswordPolicy {
    private static final int MIN_LENGTH = 8;
    private static final Pattern DIGIT = Pattern.compile(".*\\d.*");
    private static final Pattern SPECIAL = Pattern.compile(".*[^A-Za-z0-9].*");

    private PasswordPolicy() {}

    public static void requireStrong(String plainPassword) {
        if (plainPassword == null || plainPassword.length() < MIN_LENGTH) {
            throw new WeakPasswordException(
                    "La contraseña debe tener al menos " + MIN_LENGTH + " caracteres, un número y un carácter especial."
            );
        }
        if (plainPassword.length() > 72) {
            throw new WeakPasswordException("La contraseña no puede superar 72 caracteres (límite del algoritmo de hash).");
        }
        if (!DIGIT.matcher(plainPassword).matches()) {
            throw new WeakPasswordException("La contraseña debe incluir al menos un número.");
        }
        if (!SPECIAL.matcher(plainPassword).matches()) {
            throw new WeakPasswordException("La contraseña debe incluir al menos un carácter especial.");
        }
    }
}
