package com.rycapp.infrastructure.storage;

import com.rycapp.application.ports.out.TicketArchivoStorage;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@ConditionalOnProperty(prefix = "rycapp", name = "create-local-tables", havingValue = "true")
public class LocalTicketArchivoStorage implements TicketArchivoStorage {
    private final Path dir = Path.of(System.getProperty("java.io.tmpdir"), "rycapp-tickets");

    @Override
    public void guardarPdf(String ticketId, byte[] pdf) {
        try {
            Files.createDirectories(dir);
            Files.write(dir.resolve(ticketId + ".pdf"), pdf);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar el PDF local", e);
        }
    }

    @Override
    public String urlPrefirmada(String ticketId) {
        return "/api/tickets/" + ticketId + "/archivo";
    }

    @Override
    public byte[] leerPdf(String ticketId) {
        try {
            return Files.readAllBytes(dir.resolve(ticketId + ".pdf"));
        } catch (IOException e) {
            throw new IllegalStateException("No se encontró el PDF del ticket " + ticketId, e);
        }
    }
}
