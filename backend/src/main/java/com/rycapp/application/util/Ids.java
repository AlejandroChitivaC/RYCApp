package com.rycapp.application.util;

import java.util.UUID;

public final class Ids {
    private Ids() {}

    public static String nuevo() {
        return UUID.randomUUID().toString();
    }

    public static String oNuevo(String id) {
        return id == null || id.isBlank() ? nuevo() : id;
    }
}
