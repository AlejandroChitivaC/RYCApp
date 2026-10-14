package com.rycapp.infrastructure.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        // CloudFront OAC firma con Authorization y pisa el Bearer del navegador.
        // El JWT viaja en X-User-Token; Authorization se conserva para el entorno local.
        String token = userToken(request);
        if (token != null && !token.isEmpty()) {
                try {
                    Claims claims = jwtService.parseClaims(token);
                    String usuarioId = claims.getSubject();
                    String email = claims.get("email", String.class);
                    String nombre = claims.get("nombre", String.class);
                    String apellido = claims.get("apellido", String.class);
                    String rol = claims.get("rol", String.class);
                    var principal = new JwtPrincipal(usuarioId, email, nombre, apellido, rol);
                    var authorities = new ArrayList<SimpleGrantedAuthority>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    if (rol != null && "Administrador".equalsIgnoreCase(rol.trim())) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                    }
                    if (rol != null && "Contador".equalsIgnoreCase(rol.trim())) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_CONTADOR"));
                    }
                    if (rol != null && "Conductor".equalsIgnoreCase(rol.trim())) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_CONDUCTOR"));
                    }
                    var auth = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            authorities
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } catch (Exception ignored) {
                    SecurityContextHolder.clearContext();
                }
        }
        filterChain.doFilter(request, response);
    }

    private static String userToken(HttpServletRequest request) {
        String custom = request.getHeader("X-User-Token");
        if (custom != null && !custom.isBlank()) {
            String value = custom.trim();
            return value.regionMatches(true, 0, "Bearer ", 0, 7) ? value.substring(7).trim() : value;
        }
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String value = header.substring(7).trim();
            return value.isEmpty() ? null : value;
        }
        return null;
    }
}
