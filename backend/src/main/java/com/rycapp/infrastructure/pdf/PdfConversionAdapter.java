package com.rycapp.infrastructure.pdf;

import com.rycapp.application.ports.out.PdfConversionPort;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Component
public class PdfConversionAdapter implements PdfConversionPort {

    private static final Logger log = LoggerFactory.getLogger(PdfConversionAdapter.class);

    static {
        System.setProperty("java.awt.headless", "true");
    }

    @Override
    public byte[] imagenAPdf(byte[] imageBytes, String contentType) {
        BufferedImage source = leerImagen(imageBytes);
        BufferedImage rgb = aRgb(source);

        float imageWidth = rgb.getWidth();
        float imageHeight = rgb.getHeight();
        float maxWidth = PDRectangle.A4.getWidth();
        float maxHeight = PDRectangle.A4.getHeight();
        float scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight);
        if (scale < 1f) {
            imageWidth *= scale;
            imageHeight *= scale;
        }

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(new PDRectangle(imageWidth, imageHeight));
            document.addPage(page);
            PDImageXObject pdImage = LosslessFactory.createFromImage(document, rgb);
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.drawImage(pdImage, 0, 0, imageWidth, imageHeight);
            }
            ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();
            document.save(pdfOut);
            return pdfOut.toByteArray();
        } catch (IOException e) {
            log.error("Error al convertir imagen a PDF (tipo={})", contentType, e);
            throw new IllegalArgumentException("No se pudo convertir la imagen a PDF.");
        }
    }

    private static BufferedImage leerImagen(byte[] imageBytes) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (image == null || image.getWidth() <= 0 || image.getHeight() <= 0) {
                throw new IllegalArgumentException("El archivo no es una imagen válida o el formato no es compatible.");
            }
            return image;
        } catch (IOException e) {
            throw new IllegalArgumentException("El archivo no es una imagen válida o el formato no es compatible.");
        }
    }

    /** PDFBox rechaza JPEG CMYK y PNG con transparencia; se aplana a RGB. */
    private static BufferedImage aRgb(BufferedImage source) {
        if (source.getType() == BufferedImage.TYPE_INT_RGB) {
            return source;
        }
        BufferedImage rgb = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = rgb.createGraphics();
        try {
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, rgb.getWidth(), rgb.getHeight());
            g.drawImage(source, 0, 0, null);
        } finally {
            g.dispose();
        }
        return rgb;
    }
}
