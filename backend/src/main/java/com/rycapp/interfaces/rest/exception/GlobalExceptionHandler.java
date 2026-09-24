package com.rycapp.interfaces.rest.exception;

import com.rycapp.application.exception.ConflictException;
import com.rycapp.application.exception.AccountPendingApprovalException;
import com.rycapp.application.exception.EmailNotVerifiedException;
import com.rycapp.application.exception.InvalidCredentialsException;
import com.rycapp.application.exception.InvalidOtpException;
import com.rycapp.application.exception.NotFoundException;
import com.rycapp.application.exception.WeakPasswordException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(NotFoundException ex, HttpServletRequest request) {
        log.warn("404 | {} {} | {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.NOT_FOUND, ex, request, null, null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoStaticResource(NoResourceFoundException ex, HttpServletRequest request) {
        log.warn("404 | {} {} | ruta no mapeada", request.getMethod(), request.getRequestURI());
        return build(HttpStatus.NOT_FOUND,
                new NotFoundException("Recurso no encontrado."),
                request, null, null);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleConflict(ConflictException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ex, request, null, null);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex, HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ex, request, null, null);
    }

    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ApiErrorResponse> handleEmailNotVerified(EmailNotVerifiedException ex, HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, ex, request, null, "EMAIL_NOT_VERIFIED");
    }

    @ExceptionHandler(AccountPendingApprovalException.class)
    public ResponseEntity<ApiErrorResponse> handleAccountPending(AccountPendingApprovalException ex, HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, ex, request, null, "ACCOUNT_PENDING_APPROVAL");
    }

    @ExceptionHandler(InvalidOtpException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidOtp(InvalidOtpException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex, request, null, null);
    }

    @ExceptionHandler(WeakPasswordException.class)
    public ResponseEntity<ApiErrorResponse> handleWeakPassword(WeakPasswordException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex, request, null, "WEAK_PASSWORD");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex, request, null, null);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
        return build(HttpStatus.SERVICE_UNAVAILABLE, ex, request, null, null);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST,
                new IllegalArgumentException("El archivo excede el tamaño máximo permitido (4 MB)."),
                request, null, null);
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<ApiErrorResponse> handleIOException(IOException ex, HttpServletRequest request) {
        log.error("Error de E/S al procesar archivo", ex);
        return build(HttpStatus.BAD_REQUEST,
                new RuntimeException("Error al procesar el archivo enviado."),
                request, null, null);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleUnsupportedMediaType(HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                new IllegalArgumentException("El archivo debe enviarse como multipart/form-data."),
                request, null, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        var fieldErrors = new LinkedHashMap<String, String>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        return build(HttpStatus.BAD_REQUEST, ex, request, fieldErrors, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("500 | {} {} | {}", request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR,
                new RuntimeException("Error interno del servidor."),
                request, null, null);
    }

    private static ResponseEntity<ApiErrorResponse> build(HttpStatus status, Exception ex, HttpServletRequest request, java.util.Map<String, String> fieldErrors, String code) {
        var body = new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI(),
                fieldErrors,
                code
        );
        return ResponseEntity.status(status).body(body);
    }
}

