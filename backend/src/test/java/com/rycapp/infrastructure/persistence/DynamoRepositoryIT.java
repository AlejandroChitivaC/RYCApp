package com.rycapp.infrastructure.persistence;

import com.rycapp.domain.model.LineaNegocio;
import com.rycapp.domain.model.Operacion;
import com.rycapp.domain.model.Rol;
import com.rycapp.domain.model.Usuario;
import com.rycapp.infrastructure.persistence.adapter.LineaNegocioRepositoryAdapter;
import com.rycapp.infrastructure.persistence.adapter.OperacionRepositoryAdapter;
import com.rycapp.infrastructure.persistence.adapter.RolRepositoryAdapter;
import com.rycapp.infrastructure.persistence.adapter.UsuarioRepositoryAdapter;
import com.rycapp.infrastructure.persistence.dynamo.item.LineaNegocioItem;
import com.rycapp.infrastructure.persistence.dynamo.item.OperacionItem;
import com.rycapp.infrastructure.persistence.dynamo.item.RolItem;
import com.rycapp.infrastructure.persistence.dynamo.item.UsuarioItem;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeDefinition;
import software.amazon.awssdk.services.dynamodb.model.BillingMode;
import software.amazon.awssdk.services.dynamodb.model.CreateTableRequest;
import software.amazon.awssdk.services.dynamodb.model.GlobalSecondaryIndex;
import software.amazon.awssdk.services.dynamodb.model.KeySchemaElement;
import software.amazon.awssdk.services.dynamodb.model.KeyType;
import software.amazon.awssdk.services.dynamodb.model.Projection;
import software.amazon.awssdk.services.dynamodb.model.ProjectionType;
import software.amazon.awssdk.services.dynamodb.model.ScalarAttributeType;

import java.math.BigDecimal;
import java.net.URI;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Testcontainers
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DynamoRepositoryIT {

    @Container
    static final GenericContainer<?> dynamo = new GenericContainer<>("amazon/dynamodb-local:2.5.4")
            .withExposedPorts(8000)
            .withCommand("-jar", "DynamoDBLocal.jar", "-sharedDb", "-inMemory");

    private UsuarioRepositoryAdapter usuarios;
    private RolRepositoryAdapter roles;
    private LineaNegocioRepositoryAdapter lineas;
    private OperacionRepositoryAdapter operaciones;

    @BeforeAll
    void setup() {
        DynamoDbClient client = DynamoDbClient.builder()
                .endpointOverride(URI.create("http://" + dynamo.getHost() + ":" + dynamo.getMappedPort(8000)))
                .region(Region.US_EAST_1)
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create("local", "local")))
                .build();

        create(client, "Roles", "id", null, List.of(gsi("descripcion-index", "descripcionLower", null)));
        create(client, "Usuarios", "id", null, List.of(
                gsi("cedula-index", "cedulaLower", null),
                gsi("correo-index", "correoLower", null),
                gsi("estado-index", "estado", null)
        ));
        create(client, "LineasNegocio", "id", null, List.of(gsi("nombre-index", "nombreLower", null)));
        create(client, "Operaciones", "id", null, List.of(gsi("estado-fecha-index", "estado", "fechaInsercion")));

        DynamoDbEnhancedClient enhanced = DynamoDbEnhancedClient.builder().dynamoDbClient(client).build();
        DynamoDbTable<RolItem> rolesTable = enhanced.table("Roles", TableSchema.fromBean(RolItem.class));
        DynamoDbTable<UsuarioItem> usuariosTable = enhanced.table("Usuarios", TableSchema.fromBean(UsuarioItem.class));
        DynamoDbTable<LineaNegocioItem> lineasTable = enhanced.table("LineasNegocio", TableSchema.fromBean(LineaNegocioItem.class));
        DynamoDbTable<OperacionItem> opsTable = enhanced.table("Operaciones", TableSchema.fromBean(OperacionItem.class));

        roles = new RolRepositoryAdapter(rolesTable);
        usuarios = new UsuarioRepositoryAdapter(usuariosTable, rolesTable);
        lineas = new LineaNegocioRepositoryAdapter(lineasTable);
        operaciones = new OperacionRepositoryAdapter(opsTable);
    }

    @Test
    void usuarioPorCedula() {
        Rol rol = roles.save(new Rol(null, "Conductor"));
        Usuario saved = usuarios.save(new Usuario(null, rol.id(), "12345678", "Ana", "Perez", "ACTIVO"));

        assertTrue(usuarios.existsByCedulaIgnoreCase("12345678"));
        assertEquals("Ana", usuarios.findById(saved.id()).orElseThrow().nombre());
        assertEquals(1, usuarios.findByRolDescripcion("Conductor").size());
    }

    @Test
    void operacionFiltroPorLinea() {
        LineaNegocio linea = lineas.save(new LineaNegocio(null, "Arena", "desc", "ACTIVO"));
        Instant now = Instant.parse("2026-01-15T10:00:00Z");
        operaciones.save(new Operacion(
                null, "u1", linea.id(), "v1", "m1", "p1",
                now, now, now, "EFECTIVO", new BigDecimal("1500.00"), "viaje", "REGISTRADA"
        ));

        var filtradas = operaciones.filter(now.minusSeconds(60), now.plusSeconds(60), linea.id(), null, null);
        assertEquals(1, filtradas.size());
        assertEquals("viaje", filtradas.getFirst().descripcion());
        assertEquals(1, operaciones.findByEstado("REGISTRADA").size());
    }

    private record Gsi(String name, String pk, String sk) {}

    private static Gsi gsi(String name, String pk, String sk) {
        return new Gsi(name, pk, sk);
    }

    private static void create(DynamoDbClient client, String table, String pk, String sk, List<Gsi> indexes) {
        var defs = new java.util.LinkedHashSet<String>();
        defs.add(pk);
        if (sk != null) defs.add(sk);
        indexes.forEach(g -> {
            defs.add(g.pk);
            if (g.sk != null) defs.add(g.sk);
        });

        var request = CreateTableRequest.builder()
                .tableName(table)
                .billingMode(BillingMode.PAY_PER_REQUEST)
                .attributeDefinitions(defs.stream()
                        .map(n -> AttributeDefinition.builder().attributeName(n).attributeType(ScalarAttributeType.S).build())
                        .toList())
                .keySchema(sk == null
                        ? List.of(KeySchemaElement.builder().attributeName(pk).keyType(KeyType.HASH).build())
                        : List.of(
                        KeySchemaElement.builder().attributeName(pk).keyType(KeyType.HASH).build(),
                        KeySchemaElement.builder().attributeName(sk).keyType(KeyType.RANGE).build()
                ));

        if (!indexes.isEmpty()) {
            request.globalSecondaryIndexes(indexes.stream().map(g -> {
                var keys = new java.util.ArrayList<KeySchemaElement>();
                keys.add(KeySchemaElement.builder().attributeName(g.pk).keyType(KeyType.HASH).build());
                if (g.sk != null) {
                    keys.add(KeySchemaElement.builder().attributeName(g.sk).keyType(KeyType.RANGE).build());
                }
                return GlobalSecondaryIndex.builder()
                        .indexName(g.name)
                        .keySchema(keys)
                        .projection(Projection.builder().projectionType(ProjectionType.ALL).build())
                        .build();
            }).toList());
        }
        client.createTable(request.build());
    }
}
