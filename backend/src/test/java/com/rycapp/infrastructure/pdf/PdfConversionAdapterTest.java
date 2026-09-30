package com.rycapp.infrastructure.pdf;

import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfConversionAdapterTest {

    private final PdfConversionAdapter adapter = new PdfConversionAdapter();

    @Test
    void convierteJpegAPdf() throws Exception {
        byte[] jpeg = imagen("jpg");
        byte[] pdf = adapter.imagenAPdf(jpeg, "image/jpeg");
        assertTrue(new String(pdf, 0, 4).startsWith("%PDF"));
    }

    @Test
    void conviertePngConTransparenciaAPdf() throws Exception {
        BufferedImage png = new BufferedImage(8, 8, BufferedImage.TYPE_INT_ARGB);
        png.setRGB(0, 0, new Color(255, 0, 0, 128).getRGB());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(png, "png", out);
        byte[] pdf = adapter.imagenAPdf(out.toByteArray(), "image/png");
        assertTrue(new String(pdf, 0, 4).startsWith("%PDF"));
    }

    private static byte[] imagen(String formato) throws Exception {
        BufferedImage image = new BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB);
        image.setRGB(0, 0, Color.BLUE.getRGB());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, formato, out);
        return out.toByteArray();
    }
}
