package com.rycapp.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Ticket")
public class TicketEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Ticket")
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Operacion", nullable = false)
    private OperacionEntity operacion;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Usuario_Carga", nullable = false)
    private UsuarioEntity usuarioCarga;

    @Column(name = "Numero_Ticket", length = 100)
    private String numeroTicket;

    @Column(name = "Nombre_Archivo_Original", nullable = false, length = 255)
    private String nombreArchivoOriginal;

    @Column(name = "Hash_Sha256", nullable = false, length = 64, unique = true)
    private String hashSha256;

    @Column(name = "Tipo_Contenido_Original", nullable = false, length = 100)
    private String tipoContenidoOriginal;

    @Column(name = "Tamano_Bytes_Original", nullable = false)
    private Long tamanoBytesOriginal;

    @Column(name = "Fecha_Carga", nullable = false)
    private LocalDateTime fechaCarga;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public OperacionEntity getOperacion() { return operacion; }
    public void setOperacion(OperacionEntity operacion) { this.operacion = operacion; }

    public UsuarioEntity getUsuarioCarga() { return usuarioCarga; }
    public void setUsuarioCarga(UsuarioEntity usuarioCarga) { this.usuarioCarga = usuarioCarga; }

    public String getNumeroTicket() { return numeroTicket; }
    public void setNumeroTicket(String numeroTicket) { this.numeroTicket = numeroTicket; }

    public String getNombreArchivoOriginal() { return nombreArchivoOriginal; }
    public void setNombreArchivoOriginal(String nombreArchivoOriginal) { this.nombreArchivoOriginal = nombreArchivoOriginal; }

    public String getHashSha256() { return hashSha256; }
    public void setHashSha256(String hashSha256) { this.hashSha256 = hashSha256; }

    public String getTipoContenidoOriginal() { return tipoContenidoOriginal; }
    public void setTipoContenidoOriginal(String tipoContenidoOriginal) { this.tipoContenidoOriginal = tipoContenidoOriginal; }

    public Long getTamanoBytesOriginal() { return tamanoBytesOriginal; }
    public void setTamanoBytesOriginal(Long tamanoBytesOriginal) { this.tamanoBytesOriginal = tamanoBytesOriginal; }

    public LocalDateTime getFechaCarga() { return fechaCarga; }
    public void setFechaCarga(LocalDateTime fechaCarga) { this.fechaCarga = fechaCarga; }
}
