---
id: api-errors
title: Errores API
module: 06_API
layer: api
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [api-index]
related_modules: []
tags: [api, errors]
when_to_update: Cambios en GlobalExceptionHandler
source_paths:
  - backend/src/main/java/com/rycapp/interfaces/rest/exception/GlobalExceptionHandler.java
---

# ERRORS.md

| Excepción / caso | HTTP | code |
|------------------|------|------|
| NotFoundException / NoResourceFound | 404 | — |
| ConflictException / DataIntegrity | 409 | — |
| InvalidCredentialsException | 401 | — |
| EmailNotVerifiedException | 403 | EMAIL_NOT_VERIFIED |
| AccountPendingApprovalException | 403 | ACCOUNT_PENDING_APPROVAL |
| InvalidOtpException | 400 | — |
| WeakPasswordException | 400 | WEAK_PASSWORD |
| IllegalArgumentException | 400 | — |
| MethodArgumentNotValidException | 400 | fieldErrors |
| MaxUploadSizeExceeded | 400 | — |
| HttpMediaTypeNotSupported | 415 | — |
| IllegalStateException | 503 | — |
| Security no auth | 401 | — |
| Access denied | 403 | — |
| Genérico | 500 | — |
