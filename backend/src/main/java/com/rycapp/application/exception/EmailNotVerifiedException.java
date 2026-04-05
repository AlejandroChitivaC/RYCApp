package com.rycapp.application.exception;

public class EmailNotVerifiedException extends RuntimeException {
    public EmailNotVerifiedException() {
        super("Debes verificar tu correo electrónico (OTP) antes de iniciar sesión.");
    }
}
