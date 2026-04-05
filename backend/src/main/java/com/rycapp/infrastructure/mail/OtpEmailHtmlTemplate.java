package com.rycapp.infrastructure.mail;

/**
 * Plantilla HTML transaccional (tablas + estilos inline) alineada al layout solicitado:
 * cabecera oscura con marca, cuerpo claro, OTP en recuadro punteado con dígitos separados.
 */
public final class OtpEmailHtmlTemplate {

    /** Fondo página */
    private static final String BG_OUTER = "#e8eaef";
    /** Cabecera (azul marino / corporativo) */
    private static final String HEADER_BG = "#0f172a";
    private static final String HEADER_TITLE = "#ffffff";
    private static final String HEADER_SUB = "rgba(255,255,255,0.85)";
    /** Tarjeta */
    private static final String CARD = "#ffffff";
    private static final String TEXT = "#334155";
    private static final String TEXT_STRONG = "#0f172a";
    /** Acento marca */
    private static final String ACCENT = "#F5B800";
    /** Borde punteado del OTP (azul suave, legible en correo) */
    private static final String OTP_DASH = "#3b82f6";
    private static final String FOOTER_BAND = "#f1f5f9";
    private static final String FOOTER_MUTED = "#64748b";

    private OtpEmailHtmlTemplate() {}

    public static String buildPlainBody(String otp, int validMinutes) {
        String expira = formatExpiraPlain(validMinutes);
        return """
                RYC App — Verificación de Correo

                Hola,

                Estás registrando una cuenta en R&C Transportes (RYC App).
                Tu código de verificación (OTP) es: %s

                %s

                Si no solicitaste este registro, ignora este mensaje.

                —
                R&C Transportes · RYC App
                """.formatted(otp, expira);
    }

    private static String formatExpiraPlain(int validMinutes) {
        if (validMinutes <= 0) {
            return "Este código expira pronto.";
        }
        if (validMinutes == 1) {
            return "Este código expira en 1 minuto.";
        }
        return "Este código expira en " + validMinutes + " minutos.";
    }

    public static String buildHtmlBody(String otp, int validMinutes) {
        String digitRow = buildOtpDigitCells(otp);
        String expiraHtml = formatExpiraHtml(validMinutes);

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>RYC App - Verificación de Correo</title>
                </head>
                <body style="margin:0;padding:0;background-color:%s;-webkit-text-size-adjust:100%%;">
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background-color:%s;padding:40px 16px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:%s;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.12);">
                          <tr>
                            <td style="background-color:%s;padding:28px 32px 24px;border-bottom:3px solid %s;">
                              <p style="margin:0;font-size:22px;font-weight:800;line-height:1.25;color:%s;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">RYC App</p>
                              <p style="margin:8px 0 0;font-size:15px;font-weight:600;color:%s;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Verificación de registro</p>
                              <p style="margin:6px 0 0;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:%s;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">R&amp;C Transportes</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:28px 32px 8px;background-color:%s;">
                              <p style="margin:0;font-size:16px;line-height:1.55;color:%s;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Hola,</p>
                              <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:%s;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Estás registrando una cuenta. Introduce el siguiente código para completar el registro en <strong style="color:%s;">RYC App</strong>:</p>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:20px 32px 8px;background-color:%s;">
                              <table role="presentation" cellspacing="0" cellpadding="0" style="border:2px dashed %s;border-radius:12px;background-color:#f8fafc;">
                                <tr>
                                  %s
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:12px 32px 24px;background-color:%s;">
                              <p style="margin:0;font-size:14px;line-height:1.55;color:%s;text-align:center;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">%s</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:0 32px 28px;background-color:%s;">
                              <p style="margin:0;font-size:13px;line-height:1.5;color:%s;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Si <strong style="color:%s;">no</strong> solicitaste este correo, puedes ignorarlo de forma segura.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:18px 32px;background-color:%s;border-top:1px solid #e2e8f0;">
                              <p style="margin:0;font-size:12px;color:%s;text-align:center;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;"><strong style="color:%s;">R&amp;C Transportes</strong> · RYC App · Mensaje automático</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """
                .formatted(
                        BG_OUTER,
                        BG_OUTER,
                        CARD,
                        HEADER_BG,
                        ACCENT,
                        HEADER_TITLE,
                        HEADER_SUB,
                        HEADER_SUB,
                        CARD,
                        TEXT_STRONG,
                        TEXT,
                        TEXT_STRONG,
                        CARD,
                        OTP_DASH,
                        digitRow,
                        CARD,
                        TEXT,
                        expiraHtml,
                        CARD,
                        FOOTER_MUTED,
                        TEXT_STRONG,
                        FOOTER_BAND,
                        FOOTER_MUTED,
                        TEXT_STRONG);
    }

    private static String formatExpiraHtml(int validMinutes) {
        if (validMinutes <= 0) {
            return "Este código expira pronto.";
        }
        if (validMinutes == 1) {
            return "Este código expira en <strong style=\"color:#0f172a;\">1 minuto</strong>.";
        }
        return "Este código expira en <strong style=\"color:#0f172a;\">"
                + validMinutes
                + " minutos</strong>.";
    }

    /**
     * Una celda por dígito para que Gmail/Outlook muestren espaciado tipo &quot;2 2 6 2 1 9&quot;.
     */
    private static String buildOtpDigitCells(String otp) {
        if (otp == null || otp.isEmpty()) {
            return "<td style=\"padding:16px 20px;font-size:26px;font-weight:800;color:#0f172a;font-family:Consolas,'Courier New',monospace;\">?</td>";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < otp.length(); i++) {
            char c = otp.charAt(i);
            if (Character.isDigit(c)) {
                sb.append(
                        "<td style=\"padding:14px 12px;font-size:28px;font-weight:800;letter-spacing:0;color:#0f172a;font-family:Consolas,'Courier New',monospace;line-height:1;\">");
                sb.append(escapeHtml(String.valueOf(c)));
                sb.append("</td>");
            }
        }
        if (sb.isEmpty()) {
            sb.append(
                    "<td style=\"padding:16px 20px;font-size:26px;font-weight:800;color:#0f172a;font-family:Consolas,'Courier New',monospace;\">");
            sb.append(escapeHtml(otp));
            sb.append("</td>");
        }
        return sb.toString();
    }

    private static String escapeHtml(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
