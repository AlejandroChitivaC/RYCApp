package com.rycapp.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Ticket_Auditoria")
public class TicketAuditoriaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Auditoria")
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Ticket", nullable = false)
    private TicketEntity ticket;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Usuario", nullable = false)
    private UsuarioEntity usuario;

    @Column(name = "Fecha_Accion", nullable = false)
    private LocalDateTime fechaAccion;

    @Column(name = "Accion", nullable = false, length = 60)
    private String accion;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TicketEntity getTicket() { return ticket; }
    public void setTicket(TicketEntity ticket) { this.ticket = ticket; }

    public UsuarioEntity getUsuario() { return usuario; }
    public void setUsuario(UsuarioEntity usuario) { this.usuario = usuario; }

    public LocalDateTime getFechaAccion() { return fechaAccion; }
    public void setFechaAccion(LocalDateTime fechaAccion) { this.fechaAccion = fechaAccion; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }
}
