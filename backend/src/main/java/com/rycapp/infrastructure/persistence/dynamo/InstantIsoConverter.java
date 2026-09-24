package com.rycapp.infrastructure.persistence.dynamo;

import software.amazon.awssdk.enhanced.dynamodb.AttributeConverter;
import software.amazon.awssdk.enhanced.dynamodb.AttributeValueType;
import software.amazon.awssdk.enhanced.dynamodb.EnhancedType;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.time.Instant;

public class InstantIsoConverter implements AttributeConverter<Instant> {
    @Override
    public AttributeValue transformFrom(Instant input) {
        if (input == null) {
            return AttributeValue.fromNul(true);
        }
        return AttributeValue.fromS(input.toString());
    }

    @Override
    public Instant transformTo(AttributeValue input) {
        if (input == null || Boolean.TRUE.equals(input.nul()) || input.s() == null || input.s().isBlank()) {
            return null;
        }
        return Instant.parse(input.s());
    }

    @Override
    public EnhancedType<Instant> type() {
        return EnhancedType.of(Instant.class);
    }

    @Override
    public AttributeValueType attributeValueType() {
        return AttributeValueType.S;
    }
}
