package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.Ticket;
import com.rycapp.infrastructure.persistence.dynamo.InstantIsoConverter;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbConvertedBy;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

import java.time.Instant;

@DynamoDbBean
public class TicketItem {
    private String id;
    private String operacionId;
    private String usuarioCargaId;
    private String numeroTicket;
    private String nombreArchivoOriginal;
    private String hashSha256;
    private String tipoContenidoOriginal;
    private Long tamanoBytesOriginal;
    private Instant fechaCarga;

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    @DynamoDbSecondaryPartitionKey(indexNames = "operacion-index")
    public String getOperacionId() { return operacionId; }
    public void setOperacionId(String operacionId) { this.operacionId = operacionId; }

    public String getUsuarioCargaId() { return usuarioCargaId; }
    public void setUsuarioCargaId(String usuarioCargaId) { this.usuarioCargaId = usuarioCargaId; }

    @DynamoDbSecondaryPartitionKey(indexNames = "numero-index")
    public String getNumeroTicket() { return numeroTicket; }
    public void setNumeroTicket(String numeroTicket) { this.numeroTicket = numeroTicket; }

    public String getNombreArchivoOriginal() { return nombreArchivoOriginal; }
    public void setNombreArchivoOriginal(String nombreArchivoOriginal) { this.nombreArchivoOriginal = nombreArchivoOriginal; }

    @DynamoDbSecondaryPartitionKey(indexNames = "hash-index")
    public String getHashSha256() { return hashSha256; }
    public void setHashSha256(String hashSha256) { this.hashSha256 = hashSha256; }

    public String getTipoContenidoOriginal() { return tipoContenidoOriginal; }
    public void setTipoContenidoOriginal(String tipoContenidoOriginal) { this.tipoContenidoOriginal = tipoContenidoOriginal; }

    public Long getTamanoBytesOriginal() { return tamanoBytesOriginal; }
    public void setTamanoBytesOriginal(Long tamanoBytesOriginal) { this.tamanoBytesOriginal = tamanoBytesOriginal; }

    @DynamoDbConvertedBy(InstantIsoConverter.class)
    public Instant getFechaCarga() { return fechaCarga; }
    public void setFechaCarga(Instant fechaCarga) { this.fechaCarga = fechaCarga; }

    public Ticket toDomain() {
        return new Ticket(id, operacionId, usuarioCargaId, numeroTicket, nombreArchivoOriginal,
                hashSha256, tipoContenidoOriginal, tamanoBytesOriginal, fechaCarga);
    }

    public static TicketItem from(Ticket d) {
        TicketItem i = new TicketItem();
        i.setId(d.id());
        i.setOperacionId(d.operacionId());
        i.setUsuarioCargaId(d.usuarioCargaId());
        i.setNumeroTicket(d.numeroTicket());
        i.setNombreArchivoOriginal(d.nombreArchivoOriginal());
        i.setHashSha256(d.hashSha256());
        i.setTipoContenidoOriginal(d.tipoContenidoOriginal());
        i.setTamanoBytesOriginal(d.tamanoBytesOriginal());
        i.setFechaCarga(d.fechaCarga());
        return i;
    }
}
