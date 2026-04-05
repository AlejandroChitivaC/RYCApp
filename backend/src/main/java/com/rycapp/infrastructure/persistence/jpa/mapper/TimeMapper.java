package com.rycapp.infrastructure.persistence.jpa.mapper;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

public final class TimeMapper {
    private TimeMapper() {}

    public static LocalDateTime toLocalDateTimeUtc(Instant instant) {
        if (instant == null) return null;
        return LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }

    public static Instant toInstantUtc(LocalDateTime localDateTime) {
        if (localDateTime == null) return null;
        return localDateTime.toInstant(ZoneOffset.UTC);
    }
}

