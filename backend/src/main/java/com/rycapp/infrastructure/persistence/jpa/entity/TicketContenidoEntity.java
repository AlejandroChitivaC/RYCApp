package com.rycapp.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Ticket_Contenido")
public class TicketContenidoEntity {

    @Id
    @Column(name = "ID_Ticket")
    private Long id;

    @Lob
    @Column(name = "Contenido_Pdf", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] contenidoPdf;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public byte[] getContenidoPdf() { return contenidoPdf; }
    public void setContenidoPdf(byte[] contenidoPdf) { this.contenidoPdf = contenidoPdf; }
}
