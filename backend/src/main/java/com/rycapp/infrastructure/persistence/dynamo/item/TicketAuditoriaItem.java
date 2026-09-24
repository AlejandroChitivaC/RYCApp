package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.TicketAuditoria;
import com.rycapp.infrastructure.persistence.dynamo.InstantIsoConverter;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbConvertedBy;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import java.time.Instant;

@DynamoDbBean
public class TicketAuditoriaItem {
    private String ticketId;
    private String sk;
    private String id;
    private String usuarioId;
    private String usuarioNombre;
    private String usuarioApellido;
    private Instant fechaAccion;
    private String accion;

    @DynamoDbPartitionKey
    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    @DynamoDbSortKey
    public String getSk() { return sk; }
    public void setSk(String sk) { this.sk = sk; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }

    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }

    public String getUsuarioApellido() { return usuarioApellido; }
    public void setUsuarioApellido(String usuarioApellido) { this.usuarioApellido = usuarioApellido; }

    @DynamoDbConvertedBy(InstantIsoConverter.class)
    public Instant getFechaAccion() { return fechaAccion; }
    public void setFechaAccion(Instant fechaAccion) { this.fechaAccion = fechaAccion; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public TicketAuditoria toDomain() {
        return new TicketAuditoria(id, ticketId, usuarioId, usuarioNombre, usuarioApellido, fechaAccion, accion);
    }

    public static TicketAuditoriaItem from(TicketAuditoria d) {
        TicketAuditoriaItem i = new TicketAuditoriaItem();
        i.setId(d.id());
        i.setTicketId(d.ticketId());
        i.setUsuarioId(d.usuarioId());
        i.setUsuarioNombre(d.usuarioNombre());
        i.setUsuarioApellido(d.usuarioApellido());
        i.setFechaAccion(d.fechaAccion());
        i.setAccion(d.accion());
        String fecha = d.fechaAccion() != null ? d.fechaAccion().toString() : Instant.now().toString();
        i.setSk(fecha + "#" + d.id());
        return i;
    }
}
