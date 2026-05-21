package com.medical.careflow.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JWTTokenHelper {

    @Value("${jwt.auth.app}")
    private String appName;

    @Value("${jwt.auth.secret_key}")
    private String secretKey;

    @Value("${jwt.auth.expires_in}")
    private int expiresIn;

    public String generateToken(String userId, List<String> roles) {
        return Jwts.builder()
                .setIssuer(appName)
                .setSubject(userId)
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiresIn * 1000L))
                .signWith(getSigningKey())
                .compact();
    }

    // ✅ ADD THIS — validates signature + expiry in one call.
    // Throws ExpiredJwtException, MalformedJwtException, or SignatureException
    // on failure — the filter catches those individually.
    public boolean validateToken(String token) {
        getAllClaims(token); // throws if invalid or expired
        return true;
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    // Original method — still used by your old filter code, keep it
    public String getToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    public String getUserIdFromToken(String token) {
        return getAllClaims(token).getSubject();
    }

    public List<String> getRolesFromToken(String token) {
        return getAllClaims(token).get("roles", List.class);
    }

    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}