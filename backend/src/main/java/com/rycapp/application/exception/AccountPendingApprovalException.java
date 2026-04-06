package com.rycapp.application.exception;

public class AccountPendingApprovalException extends RuntimeException {
    public AccountPendingApprovalException() {
        super("Tu cuenta está pendiente de aprobación por un administrador.");
    }
}
