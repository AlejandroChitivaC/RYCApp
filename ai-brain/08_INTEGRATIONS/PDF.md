---
id: integration-pdf
title: Conversión PDF
module: 08_INTEGRATIONS
layer: integration
status: active
owner: backend
generated: 2026-07-13
version: "1.0.0"
depends_on: [backend-tickets]
related_modules: [tickets]
tags: [pdf, pdfbox]
when_to_update: Cambios PdfConversionAdapter
source_paths:
  - backend/src/main/java/com/rycapp/infrastructure/pdf/PdfConversionAdapter.java
  - backend/pom.xml
---

# PDF.md

- Port: `PdfConversionPort`
- Adapter: `PdfConversionAdapter` (Apache PDFBox 3.0.3)
- Uso: tickets — imagen → PDF almacenado en `Ticket_Contenido`
