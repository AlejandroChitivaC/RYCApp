package com.rycapp.infrastructure.storage;

import com.rycapp.application.ports.out.TicketArchivoStorage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;

@Component
@ConditionalOnProperty(prefix = "rycapp", name = "create-local-tables", havingValue = "false", matchIfMissing = true)
public class S3TicketArchivoStorage implements TicketArchivoStorage {
    private final S3Client s3;
    private final S3Presigner presigner;
    private final String bucket;

    public S3TicketArchivoStorage(
            S3Client s3,
            S3Presigner presigner,
            @Value("${rycapp.tickets-bucket}") String bucket
    ) {
        this.s3 = s3;
        this.presigner = presigner;
        this.bucket = bucket;
    }

    @Override
    public void guardarPdf(String ticketId, byte[] pdf) {
        s3.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key(ticketId))
                        .contentType("application/pdf")
                        .build(),
                RequestBody.fromBytes(pdf)
        );
    }

    @Override
    public String urlPrefirmada(String ticketId) {
        var request = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(bucket)
                        .key(key(ticketId))
                        .build())
                .build();
        return presigner.presignGetObject(request).url().toString();
    }

    @Override
    public byte[] leerPdf(String ticketId) {
        return s3.getObjectAsBytes(GetObjectRequest.builder()
                .bucket(bucket)
                .key(key(ticketId))
                .build()).asByteArray();
    }

    private static String key(String ticketId) {
        return "tickets/" + ticketId + ".pdf";
    }
}
