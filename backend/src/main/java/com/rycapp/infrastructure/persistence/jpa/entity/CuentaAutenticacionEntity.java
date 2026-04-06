package com.rycapp.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Cuenta_Autenticacion")
public class CuentaAutenticacionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Cuenta")
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Usuario", nullable = false, unique = true)
    private UsuarioEntity usuario;

    @Column(name = "Correo", nullable = false, length = 120, unique = true)
    private String correo;

    @Column(name = "Contrasena_Hash", nullable = false, length = 255)
    private String contrasenaHash;

    @Column(name = "Correo_Verificado", nullable = false)
    private boolean correoVerificado;

    @Column(name = "OTP_Hash", length = 64)
    private String otpHash;

    @Column(name = "OTP_Expira")
    private LocalDateTime otpExpira;

    @Column(name = "Reset_OTP_Hash", length = 64)
    private String resetOtpHash;

    @Column(name = "Reset_OTP_Expira")
    private LocalDateTime resetOtpExpira;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UsuarioEntity getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioEntity usuario) {
        this.usuario = usuario;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getContrasenaHash() {
        return contrasenaHash;
    }

    public void setContrasenaHash(String contrasenaHash) {
        this.contrasenaHash = contrasenaHash;
    }

    public boolean isCorreoVerificado() {
        return correoVerificado;
    }

    public void setCorreoVerificado(boolean correoVerificado) {
        this.correoVerificado = correoVerificado;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }

    public LocalDateTime getOtpExpira() {
        return otpExpira;
    }

    public void setOtpExpira(LocalDateTime otpExpira) {
        this.otpExpira = otpExpira;
    }

    public String getResetOtpHash() {
        return resetOtpHash;
    }

    public void setResetOtpHash(String resetOtpHash) {
        this.resetOtpHash = resetOtpHash;
    }

    public LocalDateTime getResetOtpExpira() {
        return resetOtpExpira;
    }

    public void setResetOtpExpira(LocalDateTime resetOtpExpira) {
        this.resetOtpExpira = resetOtpExpira;
    }
}
