package com.rycapp.infrastructure.persistence.dynamo;

import software.amazon.awssdk.enhanced.dynamodb.AttributeConverter;
import software.amazon.awssdk.enhanced.dynamodb.AttributeValueType;
import software.amazon.awssdk.enhanced.dynamodb.EnhancedType;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.time.LocalDate;

public class LocalDateIsoConverter implements AttributeConverter<LocalDate> {
    @Override
    public AttributeValue transformFrom(LocalDate input) {
        if (input == null) {
            return AttributeValue.fromNul(true);
        }
        return AttributeValue.fromS(input.toString());
    }

    @Override
    public LocalDate transformTo(AttributeValue input) {
        if (input == null || Boolean.TRUE.equals(input.nul()) || input.s() == null || input.s().isBlank()) {
            return null;
        }
        return LocalDate.parse(input.s());
    }

    @Override
    public EnhancedType<LocalDate> type() {
        return EnhancedType.of(LocalDate.class);
    }

    @Override
    public AttributeValueType attributeValueType() {
        return AttributeValueType.S;
    }
}
