package com.rycapp.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class OriginVerifyFilter extends OncePerRequestFilter {
    private final String expected;

    public OriginVerifyFilter(@Value("${app.origin-verify.secret:}") String expected) {
        this.expected = expected;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return expected == null || expected.isBlank();
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String got = request.getHeader("X-Origin-Verify");
        if (!expected.equals(got)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        filterChain.doFilter(request, response);
    }
}
