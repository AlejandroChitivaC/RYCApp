package com.rycapp.infrastructure.persistence.dynamo;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public final class DynamoSupport {
    private DynamoSupport() {}

    public static String lower(String value) {
        return value == null ? null : value.trim().toLowerCase();
    }

    public static <T> List<T> scanAll(DynamoDbTable<T> table) {
        List<T> out = new ArrayList<>();
        table.scan().items().forEach(out::add);
        return out;
    }

    public static <T> Optional<T> findOne(DynamoDbTable<T> table, String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(table.getItem(Key.builder().partitionValue(id).build()));
    }

    public static <T> Optional<T> queryOne(DynamoDbIndex<T> index, String partition) {
        return queryAll(index, partition).stream().findFirst();
    }

    public static <T> List<T> queryAll(DynamoDbIndex<T> index, String partition) {
        List<T> out = new ArrayList<>();
        index.query(QueryConditional.keyEqualTo(k -> k.partitionValue(partition)))
                .stream()
                .forEach(page -> out.addAll(page.items()));
        return out;
    }

    public static boolean exists(DynamoDbIndex<?> index, String partition) {
        return queryOne(index, partition).isPresent();
    }
}
