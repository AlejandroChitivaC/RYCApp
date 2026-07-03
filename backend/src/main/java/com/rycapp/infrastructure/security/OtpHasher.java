package com.rycapp.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public final class OtpHasher {
    private OtpHasher() {}

    public static String sha256Hex(byte[] bytes) {
        return com.rycapp.application.util.Sha256Hasher.hex(bytes);
    }

    public static String sha256Hex(String plain) {
        return sha256Hex(plain.getBytes(StandardCharsets.UTF_8));
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
