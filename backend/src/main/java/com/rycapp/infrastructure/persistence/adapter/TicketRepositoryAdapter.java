package com.rycapp.infrastructure.persistence.adapter;

import com.rycapp.application.ports.out.TicketRepository;
import com.rycapp.application.util.Ids;
import com.rycapp.domain.model.Ticket;
import com.rycapp.domain.model.TicketAuditoria;
import com.rycapp.infrastructure.persistence.dynamo.DynamoSupport;
import com.rycapp.infrastructure.persistence.dynamo.item.TicketAuditoriaItem;
import com.rycapp.infrastructure.persistence.dynamo.item.TicketItem;
import com.rycapp.infrastructure.persistence.dynamo.item.UsuarioItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class TicketRepositoryAdapter implements TicketRepository {
    private final DynamoDbTable<TicketItem> tickets;
    private final DynamoDbTable<TicketAuditoriaItem> auditoria;
    private final DynamoDbTable<UsuarioItem> usuarios;

    public TicketRepositoryAdapter(
            DynamoDbTable<TicketItem> ticketsTable,
            DynamoDbTable<TicketAuditoriaItem> ticketAuditoriaTable,
            DynamoDbTable<UsuarioItem> usuariosTable
    ) {
        this.tickets = ticketsTable;
        this.auditoria = ticketAuditoriaTable;
        this.usuarios = usuariosTable;
    }

    @Override
    public Ticket save(Ticket ticket) {
        TicketItem item = TicketItem.from(new Ticket(
                Ids.oNuevo(ticket.id()),
                ticket.operacionId(),
                ticket.usuarioCargaId(),
                ticket.numeroTicket(),
                ticket.nombreArchivoOriginal(),
                ticket.hashSha256(),
                ticket.tipoContenidoOriginal(),
                ticket.tamanoBytesOriginal(),
                ticket.fechaCarga()
        ));
        tickets.putItem(item);
        return item.toDomain();
    }

    @Override
    public Optional<Ticket> findById(String id) {
        return DynamoSupport.findOne(tickets, id).map(TicketItem::toDomain);
    }

    @Override
    public List<Ticket> findAll() {
        return DynamoSupport.scanAll(tickets).stream().map(TicketItem::toDomain).toList();
    }

    @Override
    public List<Ticket> findByOperacionId(String operacionId) {
        return DynamoSupport.queryAll(tickets.index("operacion-index"), operacionId).stream()
                .map(TicketItem::toDomain)
                .toList();
    }

    @Override
    public boolean existsByHashSha256(String hashSha256) {
        return DynamoSupport.exists(tickets.index("hash-index"), hashSha256);
    }

    @Override
    public boolean existsByNumeroTicket(String numeroTicket) {
        return DynamoSupport.exists(tickets.index("numero-index"), numeroTicket);
    }

    @Override
    public void saveAuditoria(TicketAuditoria entrada) {
        String id = Ids.oNuevo(entrada.id());
        String nombre = entrada.usuarioNombre();
        String apellido = entrada.usuarioApellido();
        if ((nombre == null || apellido == null) && entrada.usuarioId() != null) {
            var usuario = DynamoSupport.findOne(usuarios, entrada.usuarioId());
            if (usuario.isPresent()) {
                if (nombre == null) {
                    nombre = usuario.get().getNombre();
                }
                if (apellido == null) {
                    apellido = usuario.get().getApellido();
                }
            }
        }
        TicketAuditoria completa = new TicketAuditoria(
                id, entrada.ticketId(), entrada.usuarioId(), nombre, apellido, entrada.fechaAccion(), entrada.accion()
        );
        auditoria.putItem(TicketAuditoriaItem.from(completa));
    }

    @Override
    public List<TicketAuditoria> findAllAuditoria() {
        return DynamoSupport.scanAll(auditoria).stream().map(TicketAuditoriaItem::toDomain).toList();
    }

    @Override
    public List<TicketAuditoria> findAuditoriaByTicketId(String ticketId) {
        List<TicketAuditoriaItem> out = new ArrayList<>();
        auditoria.query(r -> r.queryConditional(
                QueryConditional.keyEqualTo(k -> k.partitionValue(ticketId))
        )).items().forEach(out::add);
        return out.stream().map(TicketAuditoriaItem::toDomain).toList();
    }
}
