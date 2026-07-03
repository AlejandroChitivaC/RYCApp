package com.rycapp.infrastructure.pdf;

import com.rycapp.application.ports.out.PdfConversionPort;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Component
public class PdfConversionAdapter implements PdfConversionPort {

    private static final Logger log = LoggerFactory.getLogger(PdfConversionAdapter.class);

    @Override
    public byte[] imagenAPdf(byte[] imageBytes, String contentType) {
        try {
            BufferedImage bufferedImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (bufferedImage == null) {
                throw new IllegalArgumentException("El archivo no es una imagen válida o el formato no es compatible.");
            }

            float imageWidth = bufferedImage.getWidth();
            float imageHeight = bufferedImage.getHeight();

            float maxWidth = PDRectangle.A4.getWidth();
            float maxHeight = PDRectangle.A4.getHeight();
            float scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight);
            if (scale < 1f) {
                imageWidth *= scale;
                imageHeight *= scale;
            }

            try (PDDocument document = new PDDocument()) {
                PDRectangle pageSize = new PDRectangle(imageWidth, imageHeight);
                PDPage page = new PDPage(pageSize);
                document.addPage(page);

                byte[] bytesParaPdf = resolverBytesCompatibles(bufferedImage, imageBytes, contentType);
                PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, bytesParaPdf, "ticket");

                try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                    contentStream.drawImage(pdImage, 0, 0, imageWidth, imageHeight);
                }

                ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();
                document.save(pdfOut);
                return pdfOut.toByteArray();
            }
        } catch (IOException e) {
            log.error("Error al convertir imagen a PDF", e);
            throw new RuntimeException("Error al convertir la imagen a PDF.", e);
        }
    }

    private byte[] resolverBytesCompatibles(BufferedImage imagen, byte[] bytesOriginales, String contentType) throws IOException {
        String tipo = contentType != null ? contentType.toLowerCase() : "";
        if (tipo.contains("jpeg") || tipo.contains("jpg")) {
            return bytesOriginales;
        }
        ByteArrayOutputStream pngOut = new ByteArrayOutputStream();
        ImageIO.write(imagen, "png", pngOut);
        return pngOut.toByteArray();
    }
}
