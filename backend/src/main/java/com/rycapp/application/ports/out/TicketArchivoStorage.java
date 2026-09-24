package com.rycapp.application.ports.out;

public interface TicketArchivoStorage {
    void guardarPdf(String ticketId, byte[] pdf);

    String urlPrefirmada(String ticketId);

    byte[] leerPdf(String ticketId);
}
