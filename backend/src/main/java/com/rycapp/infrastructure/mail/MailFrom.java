package com.rycapp.infrastructure.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.io.UnsupportedEncodingException;

final class MailFrom {
    static final String NOMBRE = "R&C App";

    private MailFrom() {}

    static void apply(MimeMessageHelper helper, String fromAddress) throws MessagingException, UnsupportedEncodingException {
        String email = new InternetAddress(fromAddress).getAddress();
        helper.setFrom(email, NOMBRE);
    }
}
