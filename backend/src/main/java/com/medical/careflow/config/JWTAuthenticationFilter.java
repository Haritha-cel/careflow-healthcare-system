package com.medical.careflow.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JWTAuthenticationFilter.class);
    private final JWTTokenHelper jwtTokenHelper;

    public JWTAuthenticationFilter(JWTTokenHelper jwtTokenHelper) {
        this.jwtTokenHelper = jwtTokenHelper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // Cookie first (web admin), then Authorization header (mobile)
            String token = extractTokenFromCookie(request);
            if (token == null) {
                token = jwtTokenHelper.getToken(request);
            }

            if (token != null && isWellFormed(token) && jwtTokenHelper.validateToken(token)) {
                String userId = jwtTokenHelper.getUserIdFromToken(token);
                List<String> roles = jwtTokenHelper.getRolesFromToken(token);

                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);

                // ✅ THE FIX: Set request attributes so @RequestAttribute works in controllers.
                // Controllers use @RequestAttribute("userId") and @RequestAttribute("doctorId")
                // to identify who is making the request. Without this, they get null → 500.
                if (roles.contains("PATIENT")) {
                    request.setAttribute("userId", userId);
                } else if (roles.contains("DOCTOR")) {
                    request.setAttribute("doctorId", userId); // doctorId stored under userId field in JWT subject
                } else if (roles.contains("ADMIN")) {
                    request.setAttribute("adminId", userId);
                }
            }

        } catch (ExpiredJwtException e) {
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Token expired");
            return;
        } catch (MalformedJwtException | SignatureException e) {
            logger.warn("Malformed/tampered JWT from IP {}: {}", request.getRemoteAddr(), e.getMessage());
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        } catch (Exception e) {
            logger.error("Authentication error: {}", e.getMessage());
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication error");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if ("accessToken".equals(c.getName()) &&
                    c.getValue() != null &&
                    !c.getValue().isBlank()) {
                return c.getValue();
            }
        }
        return null;
    }

    private boolean isWellFormed(String token) {
        if (token == null || token.length() > 2048) return false;
        String[] parts = token.split("\\.");
        return parts.length == 3 &&
                parts[0].length() > 0 &&
                parts[1].length() > 0 &&
                parts[2].length() > 0;
    }

    private void writeError(HttpServletResponse response, int status, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                String.format("{\"error\":\"%s\",\"status\":%d}", message, status)
        );
    }
}