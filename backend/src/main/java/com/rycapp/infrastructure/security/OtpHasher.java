package com.rycapp.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public final class OtpHasher {
    private OtpHasher() {}

    public static String sha256Hex(String plain) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(plain.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }

    /**
     * Compara en tiempo constante el hash SHA-256 en hex almacenado con el OTP en texto plano.
     */
    public static boolean matches(String storedSha256Hex, String plainOtp) {
        if (storedSha256Hex == null || plainOtp == null) return false;
        String computed = sha256Hex(plainOtp.trim());
        try {
            return MessageDigest.isEqual(
                    HexFormat.of().parseHex(storedSha256Hex),
                    HexFormat.of().parseHex(computed)
            );
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
