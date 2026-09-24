package com.rycapp.infrastructure.persistence.dynamo;

import org.junit.jupiter.api.Test;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class InstantIsoConverterTest {

    private final InstantIsoConverter converter = new InstantIsoConverter();

    @Test
    void roundtrip() {
        Instant now = Instant.parse("2026-03-12T15:30:00Z");
        AttributeValue value = converter.transformFrom(now);
        assertEquals("2026-03-12T15:30:00Z", value.s());
        assertEquals(now, converter.transformTo(value));
    }

    @Test
    void nulos() {
        assertNull(converter.transformTo(AttributeValue.fromNul(true)));
        assertEquals(true, converter.transformFrom(null).nul());
    }
}
