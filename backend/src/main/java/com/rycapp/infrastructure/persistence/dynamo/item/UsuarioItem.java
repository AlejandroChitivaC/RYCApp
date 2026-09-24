package com.rycapp.infrastructure.persistence.dynamo.item;

import com.rycapp.domain.model.CuentaAutenticacion;
import com.rycapp.domain.model.Usuario;
import com.rycapp.infrastructure.persistence.dynamo.InstantIsoConverter;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbConvertedBy;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

import java.time.Instant;

@DynamoDbBean
public class UsuarioItem {
    private String id;
    private String rolId;
    private String rolDescripcion;
    private String cedula;
    private String cedulaLower;
    private String nombre;
    private String apellido;
    private String estado;
    private String correo;
    private String correoLower;
    private String contrasenaHash;
    private Boolean correoVerificado;
    private String otpHash;
    private Instant otpExpira;
    private String resetOtpHash;
    private Instant resetOtpExpira;

    @DynamoDbPartitionKey
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRolId() { return rolId; }
    public void setRolId(String rolId) { this.rolId = rolId; }

    public String getRolDescripcion() { return rolDescripcion; }
    public void setRolDescripcion(String rolDescripcion) { this.rolDescripcion = rolDescripcion; }

    public String getCedula() { return cedula; }
    public void setCedula(String cedula) { this.cedula = cedula; }

    @DynamoDbSecondaryPartitionKey(indexNames = "cedula-index")
    public String getCedulaLower() { return cedulaLower; }
    public void setCedulaLower(String cedulaLower) { this.cedulaLower = cedulaLower; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    @DynamoDbSecondaryPartitionKey(indexNames = "estado-index")
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    @DynamoDbSecondaryPartitionKey(indexNames = "correo-index")
    public String getCorreoLower() { return correoLower; }
    public void setCorreoLower(String correoLower) { this.correoLower = correoLower; }

    public String getContrasenaHash() { return contrasenaHash; }
    public void setContrasenaHash(String contrasenaHash) { this.contrasenaHash = contrasenaHash; }

    public Boolean getCorreoVerificado() { return correoVerificado; }
    public void setCorreoVerificado(Boolean correoVerificado) { this.correoVerificado = correoVerificado; }

    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }

    @DynamoDbConvertedBy(InstantIsoConverter.class)
    public Instant getOtpExpira() { return otpExpira; }
    public void setOtpExpira(Instant otpExpira) { this.otpExpira = otpExpira; }

    public String getResetOtpHash() { return resetOtpHash; }
    public void setResetOtpHash(String resetOtpHash) { this.resetOtpHash = resetOtpHash; }

    @DynamoDbConvertedBy(InstantIsoConverter.class)
    public Instant getResetOtpExpira() { return resetOtpExpira; }
    public void setResetOtpExpira(Instant resetOtpExpira) { this.resetOtpExpira = resetOtpExpira; }

    public Usuario toUsuario() {
        return new Usuario(id, rolId, cedula, nombre, apellido, estado);
    }

    public CuentaAutenticacion toCuenta() {
        if (correo == null || correo.isBlank()) {
            return null;
        }
        return new CuentaAutenticacion(
                id,
                correo,
                contrasenaHash,
                Boolean.TRUE.equals(correoVerificado),
                otpHash,
                otpExpira,
                resetOtpHash,
                resetOtpExpira
        );
    }

    public void applyUsuario(Usuario u) {
        this.rolId = u.rolId();
        this.cedula = u.cedula();
        this.cedulaLower = u.cedula() == null ? null : u.cedula().trim().toLowerCase();
        this.nombre = u.nombre();
        this.apellido = u.apellido();
        this.estado = u.estado();
    }

    public void applyCuenta(CuentaAutenticacion c) {
        this.correo = c.correo();
        this.correoLower = c.correo() == null ? null : c.correo().trim().toLowerCase();
        this.contrasenaHash = c.contrasenaHash();
        this.correoVerificado = c.correoVerificado();
        this.otpHash = c.otpHash();
        this.otpExpira = c.otpExpira();
        this.resetOtpHash = c.resetOtpHash();
        this.resetOtpExpira = c.resetOtpExpira();
    }
}
