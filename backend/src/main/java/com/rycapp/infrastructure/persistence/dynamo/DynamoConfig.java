package com.rycapp.infrastructure.persistence.dynamo;

import com.rycapp.infrastructure.persistence.dynamo.item.CostoItem;
import com.rycapp.infrastructure.persistence.dynamo.item.FacturaSiigoItem;
import com.rycapp.infrastructure.persistence.dynamo.item.LineaNegocioItem;
import com.rycapp.infrastructure.persistence.dynamo.item.MaterialItem;
import com.rycapp.infrastructure.persistence.dynamo.item.OperacionItem;
import com.rycapp.infrastructure.persistence.dynamo.item.ProveedorItem;
import com.rycapp.infrastructure.persistence.dynamo.item.RolItem;
import com.rycapp.infrastructure.persistence.dynamo.item.TicketAuditoriaItem;
import com.rycapp.infrastructure.persistence.dynamo.item.TicketItem;
import com.rycapp.infrastructure.persistence.dynamo.item.TipoCostoItem;
import com.rycapp.infrastructure.persistence.dynamo.item.UsuarioItem;
import com.rycapp.infrastructure.persistence.dynamo.item.VehiculoItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class DynamoConfig {

    @Bean
    public DynamoDbClient dynamoDbClient(
            @Value("${aws.region}") String region,
            @Value("${aws.dynamodb.endpoint:}") String endpoint
    ) {
        var builder = DynamoDbClient.builder()
                .region(Region.of(region))
                .httpClientBuilder(UrlConnectionHttpClient.builder());
        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create("local", "local")
                    ));
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }
        return builder.build();
    }

    @Bean
    public DynamoDbEnhancedClient dynamoDbEnhancedClient(DynamoDbClient client) {
        return DynamoDbEnhancedClient.builder().dynamoDbClient(client).build();
    }

    @Bean
    public S3Client s3Client(
            @Value("${aws.region}") String region,
            @Value("${aws.s3.endpoint:}") String endpoint
    ) {
        var builder = S3Client.builder()
                .region(Region.of(region))
                .httpClientBuilder(UrlConnectionHttpClient.builder());
        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint))
                    .forcePathStyle(true)
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create("local", "local")
                    ));
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }
        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner(
            @Value("${aws.region}") String region,
            @Value("${aws.s3.endpoint:}") String endpoint
    ) {
        var builder = S3Presigner.builder().region(Region.of(region));
        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create("local", "local")
                    ));
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }
        return builder.build();
    }

    @Bean
    public DynamoDbTable<UsuarioItem> usuariosTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.usuarios}") String name
    ) {
        return client.table(name, TableSchema.fromBean(UsuarioItem.class));
    }

    @Bean
    public DynamoDbTable<RolItem> rolesTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.roles}") String name
    ) {
        return client.table(name, TableSchema.fromBean(RolItem.class));
    }

    @Bean
    public DynamoDbTable<LineaNegocioItem> lineasNegocioTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.lineasNegocio}") String name
    ) {
        return client.table(name, TableSchema.fromBean(LineaNegocioItem.class));
    }

    @Bean
    public DynamoDbTable<MaterialItem> materialesTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.materiales}") String name
    ) {
        return client.table(name, TableSchema.fromBean(MaterialItem.class));
    }

    @Bean
    public DynamoDbTable<TipoCostoItem> tiposCostoTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.tiposCosto}") String name
    ) {
        return client.table(name, TableSchema.fromBean(TipoCostoItem.class));
    }

    @Bean
    public DynamoDbTable<ProveedorItem> proveedoresTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.proveedores}") String name
    ) {
        return client.table(name, TableSchema.fromBean(ProveedorItem.class));
    }

    @Bean
    public DynamoDbTable<VehiculoItem> vehiculosTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.vehiculos}") String name
    ) {
        return client.table(name, TableSchema.fromBean(VehiculoItem.class));
    }

    @Bean
    public DynamoDbTable<OperacionItem> operacionesTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.operaciones}") String name
    ) {
        return client.table(name, TableSchema.fromBean(OperacionItem.class));
    }

    @Bean
    public DynamoDbTable<CostoItem> costosTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.costos}") String name
    ) {
        return client.table(name, TableSchema.fromBean(CostoItem.class));
    }

    @Bean
    public DynamoDbTable<TicketItem> ticketsTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.tickets}") String name
    ) {
        return client.table(name, TableSchema.fromBean(TicketItem.class));
    }

    @Bean
    public DynamoDbTable<TicketAuditoriaItem> ticketAuditoriaTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.ticketAuditoria}") String name
    ) {
        return client.table(name, TableSchema.fromBean(TicketAuditoriaItem.class));
    }

    @Bean
    public DynamoDbTable<FacturaSiigoItem> facturasSiigoTable(
            DynamoDbEnhancedClient client,
            @Value("${rycapp.tables.facturasSiigo}") String name
    ) {
        return client.table(name, TableSchema.fromBean(FacturaSiigoItem.class));
    }
}
