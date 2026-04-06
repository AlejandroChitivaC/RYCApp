package com.rycapp.infrastructure.mail;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class MailOtpSender {
    private static final Logger log = LoggerFactory.getLogger(MailOtpSender.class);
    private static final String SUBJECT_VERIFICACION = "RYC App - Verificación de Correo";
    private static final String SUBJECT_RESET = "RYC App - Código para restablecer contraseña";

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String fromAddress;

    public MailOtpSender(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.mail.from:noreply@rycapp.local}") String fromAddress
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.fromAddress = fromAddress;
    }

    public void sendOtp(String toEmail, String plainOtp, int validMinutes) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn(
                    "[OTP] JavaMailSender no configurado (defina spring.mail.host). Correo={} Código={} (válido {} min)",
                    toEmail,
                    plainOtp,
                    validMinutes
            );
            return;
        }
        try {
            String plain = OtpEmailHtmlTemplate.buildPlainBody(plainOtp, validMinutes);
            String html = OtpEmailHtmlTemplate.buildHtmlBody(plainOtp, validMinutes);

            MimeMessage mime = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(SUBJECT_VERIFICACION);
            helper.setText(plain, html);
            sender.send(mime);
            log.info("OTP enviado por correo a {}", toEmail);
        } catch (Exception e) {
            log.error("No se pudo enviar el correo OTP a {}: {}", toEmail, e.getMessage());
            if (isSmtpAuthFailure(e)) {
                log.error(
                        "SMTP: autenticación rechazada. En Brevo → Ajustes → SMTP y API → SMTP: "
                                + "usuario = valor exacto de «SMTP login» (correo que muestra el panel); "
                                + "contraseña = clave SMTP (empieza por xsmtpsib-), no la API key (xkeysib-) ni la contraseña web. "
                                + "Regenera la clave SMTP si hace falta y comprueba que el envío transaccional esté activo.");
            }
            log.warn("[OTP] Código de respaldo para {}: {}", toEmail, plainOtp);
        }
    }

    public void sendPasswordResetOtp(String toEmail, String plainOtp, int validMinutes) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn(
                    "[RESET] JavaMailSender no configurado. Correo={} Código={} (válido {} min)",
                    toEmail,
                    plainOtp,
                    validMinutes
            );
            return;
        }
        try {
            String plain = OtpEmailHtmlTemplate.buildPasswordResetPlainBody(plainOtp, validMinutes);
            String html = OtpEmailHtmlTemplate.buildPasswordResetHtmlBody(plainOtp, validMinutes);

            MimeMessage mime = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(SUBJECT_RESET);
            helper.setText(plain, html);
            sender.send(mime);
            log.info("OTP de recuperación enviado a {}", toEmail);
        } catch (Exception e) {
            log.error("No se pudo enviar el correo de recuperación a {}: {}", toEmail, e.getMessage());
            if (isSmtpAuthFailure(e)) {
                log.error(
                        "SMTP: autenticación rechazada. Compruebe credenciales SMTP (Brevo u otro proveedor).");
            }
            log.warn("[RESET] Código de respaldo para {}: {}", toEmail, plainOtp);
        }
    }

    private static boolean isSmtpAuthFailure(Throwable e) {
        for (Throwable c = e; c != null; c = c.getCause()) {
            String m = c.getMessage();
            if (m != null) {
                String lower = m.toLowerCase();
                if (lower.contains("authentication failed")
                        || lower.contains("535")
                        || lower.contains("auth failed")
                        || lower.contains("invalid login")) {
                    return true;
                }
            }
        }
        return false;
    }
}
