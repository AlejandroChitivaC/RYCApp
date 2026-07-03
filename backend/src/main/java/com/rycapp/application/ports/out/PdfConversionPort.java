package com.rycapp.application.ports.out;

public interface PdfConversionPort {
    byte[] imagenAPdf(byte[] imageBytes, String contentType);
}
