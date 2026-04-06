package com.rycapp.application.exception;

public class EmailNotVerifiedException extends RuntimeException {
    public EmailNotVerifiedException() {
        super("Tu correo aún no está verificado (inactivo). Completa la verificación con el código OTP para poder iniciar sesión.");
    }
}
