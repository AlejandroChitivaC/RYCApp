package com.rycapp.infrastructure.persistence.dynamo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeDefinition;
import software.amazon.awssdk.services.dynamodb.model.BillingMode;
import software.amazon.awssdk.services.dynamodb.model.CreateTableRequest;
import software.amazon.awssdk.services.dynamodb.model.GlobalSecondaryIndex;
import software.amazon.awssdk.services.dynamodb.model.KeySchemaElement;
import software.amazon.awssdk.services.dynamodb.model.KeyType;
import software.amazon.awssdk.services.dynamodb.model.Projection;
import software.amazon.awssdk.services.dynamodb.model.ProjectionType;
import software.amazon.awssdk.services.dynamodb.model.ResourceInUseException;
import software.amazon.awssdk.services.dynamodb.model.ScalarAttributeType;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
@ConditionalOnProperty(prefix = "rycapp", name = "create-local-tables", havingValue = "true")
@Order(0)
public class LocalTablesInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(LocalTablesInitializer.class);

    private final DynamoDbClient client;
    private final String usuarios;
    private final String roles;
    private final String lineas;
    private final String materiales;
    private final String tiposCosto;
    private final String proveedores;
    private final String vehiculos;
    private final String operaciones;
    private final String costos;
    private final String tickets;
    private final String auditoria;
    private final String facturas;

    public LocalTablesInitializer(
            DynamoDbClient client,
            @Value("${rycapp.tables.usuarios}") String usuarios,
            @Value("${rycapp.tables.roles}") String roles,
            @Value("${rycapp.tables.lineasNegocio}") String lineas,
            @Value("${rycapp.tables.materiales}") String materiales,
            @Value("${rycapp.tables.tiposCosto}") String tiposCosto,
            @Value("${rycapp.tables.proveedores}") String proveedores,
            @Value("${rycapp.tables.vehiculos}") String vehiculos,
            @Value("${rycapp.tables.operaciones}") String operaciones,
            @Value("${rycapp.tables.costos}") String costos,
            @Value("${rycapp.tables.tickets}") String tickets,
            @Value("${rycapp.tables.ticketAuditoria}") String auditoria,
            @Value("${rycapp.tables.facturasSiigo}") String facturas
    ) {
        this.client = client;
        this.usuarios = usuarios;
        this.roles = roles;
        this.lineas = lineas;
        this.materiales = materiales;
        this.tiposCosto = tiposCosto;
        this.proveedores = proveedores;
        this.vehiculos = vehiculos;
        this.operaciones = operaciones;
        this.costos = costos;
        this.tickets = tickets;
        this.auditoria = auditoria;
        this.facturas = facturas;
    }

    @Override
    public void run(ApplicationArguments args) {
        create(usuarios, "id", null, List.of(
                gsi("cedula-index", "cedulaLower", null),
                gsi("correo-index", "correoLower", null),
                gsi("estado-index", "estado", null)
        ));
        create(roles, "id", null, List.of(gsi("descripcion-index", "descripcionLower", null)));
        create(lineas, "id", null, List.of(gsi("nombre-index", "nombreLower", null)));
        create(materiales, "id", null, List.of(gsi("nombre-index", "nombreLower", null)));
        create(tiposCosto, "id", null, List.of());
        create(proveedores, "id", null, List.of(gsi("nit-index", "nitLower", null)));
        create(vehiculos, "id", null, List.of(
                gsi("placa-index", "placaLower", null),
                gsi("conductor-index", "conductorId", null)
        ));
        create(operaciones, "id", null, List.of(gsi("estado-fecha-index", "estado", "fechaInsercion")));
        create(costos, "id", null, List.of(gsi("categoria-fecha-index", "categoria", "fechaInsercion")));
        create(tickets, "id", null, List.of(
                gsi("hash-index", "hashSha256", null),
                gsi("numero-index", "numeroTicket", null),
                gsi("operacion-index", "operacionId", null)
        ));
        create(auditoria, "ticketId", "sk", List.of());
        create(facturas, "id", null, List.of(gsi("operacion-index", "operacionId", null)));
        log.info("Tablas locales listas en DynamoDB Local");
    }

    private record GsiSpec(String name, String pk, String sk) {}

    private static GsiSpec gsi(String name, String pk, String sk) {
        return new GsiSpec(name, pk, sk);
    }

    private void create(String table, String pk, String sk, List<GsiSpec> indexes) {
        Set<String> attrs = new LinkedHashSet<>();
        attrs.add(pk);
        if (sk != null) {
            attrs.add(sk);
        }
        for (GsiSpec g : indexes) {
            attrs.add(g.pk);
            if (g.sk != null) {
                attrs.add(g.sk);
            }
        }

        List<AttributeDefinition> definitions = new ArrayList<>();
        for (String name : attrs) {
            definitions.add(AttributeDefinition.builder()
                    .attributeName(name)
                    .attributeType(ScalarAttributeType.S)
                    .build());
        }

        List<KeySchemaElement> keySchema = new ArrayList<>();
        keySchema.add(KeySchemaElement.builder().attributeName(pk).keyType(KeyType.HASH).build());
        if (sk != null) {
            keySchema.add(KeySchemaElement.builder().attributeName(sk).keyType(KeyType.RANGE).build());
        }

        var request = CreateTableRequest.builder()
                .tableName(table)
                .billingMode(BillingMode.PAY_PER_REQUEST)
                .attributeDefinitions(definitions)
                .keySchema(keySchema);

        if (!indexes.isEmpty()) {
            List<GlobalSecondaryIndex> gsis = new ArrayList<>();
            for (GsiSpec g : indexes) {
                List<KeySchemaElement> gsiKeys = new ArrayList<>();
                gsiKeys.add(KeySchemaElement.builder().attributeName(g.pk).keyType(KeyType.HASH).build());
                if (g.sk != null) {
                    gsiKeys.add(KeySchemaElement.builder().attributeName(g.sk).keyType(KeyType.RANGE).build());
                }
                gsis.add(GlobalSecondaryIndex.builder()
                        .indexName(g.name)
                        .keySchema(gsiKeys)
                        .projection(Projection.builder().projectionType(ProjectionType.ALL).build())
                        .build());
            }
            request.globalSecondaryIndexes(gsis);
        }

        try {
            client.createTable(request.build());
        } catch (ResourceInUseException ignored) {
            // ya existe
        }
    }
}
