package com.rycapp.infrastructure.mail;

import com.rycapp.infrastructure.persistence.jpa.repository.CuentaAutenticacionJpaRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class MailAccountNotifications {
    private static final Logger log = LoggerFactory.getLogger(MailAccountNotifications.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String fromAddress;
    private final CuentaAutenticacionJpaRepository cuentaJpaRepository;

    public MailAccountNotifications(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.mail.from:noreply@rycapp.local}") String fromAddress,
            CuentaAutenticacionJpaRepository cuentaJpaRepository
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.fromAddress = fromAddress;
        this.cuentaJpaRepository = cuentaJpaRepository;
    }

    public void notificarAdminsCuentaEsperandoAprobacion(String nombre, String apellido, String correo, String cedula) {
        var destinos = cuentaJpaRepository.findCorreosAdministradores();
        if (destinos.isEmpty()) {
            log.warn("[Cuenta] Sin correos de administrador para notificar (ninguna cuenta con rol Administrador).");
            return;
        }
        String subject = "RYC App - Cuenta verificada pendiente de activación";
        String plain = """
                Un usuario completó la verificación de correo y espera que actives su cuenta.

                Nombre: %s %s
                Cédula: %s
                Correo: %s

                Ingresa al panel de usuarios para aprobar la cuenta.
                """.formatted(nombre, apellido, cedula, correo);
        String html = "<p>Un usuario completó la verificación de correo y espera activación.</p>"
                + "<ul><li><strong>Nombre:</strong> " + escape(nombre) + " " + escape(apellido) + "</li>"
                + "<li><strong>Cédula:</strong> " + escape(cedula) + "</li>"
                + "<li><strong>Correo:</strong> " + escape(correo) + "</li></ul>";
        sendBulk(destinos, subject, plain, html);
    }

    public void notificarUsuarioCuentaActivada(String toEmail, String nombre) {
        String subject = "RYC App - Tu cuenta está activa";
        String plain = "Hola " + nombre + ",\n\nUn administrador activó tu cuenta. Ya puedes iniciar sesión.\n";
        String html = "<p>Hola " + escape(nombre) + ",</p><p>Un administrador activó tu cuenta. Ya puedes iniciar sesión.</p>";
        sendOne(toEmail, subject, plain, html);
    }

    private void sendBulk(Iterable<String> tos, String subject, String plain, String html) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn("[Cuenta] JavaMailSender no configurado. Asunto: {}", subject);
            return;
        }
        for (String to : tos) {
            if (to == null || to.isBlank()) continue;
            try {
                sendWithSender(sender, fromAddress, to.trim(), subject, plain, html);
            } catch (Exception e) {
                log.error("No se pudo enviar notificación a {}: {}", to, e.getMessage());
            }
        }
    }

    private void sendOne(String toEmail, String subject, String plain, String html) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn("[Cuenta] JavaMailSender no configurado. Correo usuario: {}", toEmail);
            return;
        }
        try {
            sendWithSender(sender, fromAddress, toEmail, subject, plain, html);
        } catch (Exception e) {
            log.error("No se pudo enviar activación a {}: {}", toEmail, e.getMessage());
        }
    }

    private static void sendWithSender(
            JavaMailSender sender,
            String from,
            String to,
            String subject,
            String plain,
            String html
    ) throws Exception {
        MimeMessage mime = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(plain, html);
        sender.send(mime);
        log.info("Correo de cuenta enviado a {}", to);
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
