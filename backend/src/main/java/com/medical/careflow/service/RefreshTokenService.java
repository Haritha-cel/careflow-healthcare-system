package com.medical.careflow.service;

import com.medical.careflow.exception.BadRequestException;
import com.medical.careflow.model.RefreshToken;
import com.medical.careflow.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final Logger logger = LoggerFactory.getLogger(RefreshTokenService.class);

    // ✅ Max active refresh tokens per user (prevents Storage DoS)
    private static final int MAX_TOKENS_PER_USER = 5;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    // ── Hash utility ─────────────────────────────────────────────
    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    // ── Create ───────────────────────────────────────────────────
    public RefreshToken createRefreshToken(String userId, List<String> roles) {

        // ✅ FIX 1: Enforce max tokens per user (Storage DoS prevention)
        List<RefreshToken> existingTokens = refreshTokenRepository.findAllByUserId(userId);

        if (existingTokens.size() >= MAX_TOKENS_PER_USER) {
            // Delete the oldest token to make room (FIFO eviction)
            existingTokens.stream()
                    .min((a, b) -> a.getExpiryDate().compareTo(b.getExpiryDate()))
                    .ifPresent(oldest -> {
                        logger.warn("🔐 Max tokens reached for user {}. Evicting oldest token.", userId);
                        refreshTokenRepository.delete(oldest);
                    });
        }

        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashToken(rawToken);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setRoles(roles);
        refreshToken.setExpiryDate(new Date(System.currentTimeMillis() + 604800000L)); // 7 days
        refreshToken.setToken(hashedToken); // ✅ Store hash only

        // ✅ FIX 2: Store a "family ID" to detect token theft via replay detection
        // All tokens from the same login session share a familyId
        refreshToken.setFamilyId(UUID.randomUUID().toString());
        refreshToken.setReused(false);

        refreshTokenRepository.save(refreshToken);

        // Return raw token to client, hash stays in DB
        refreshToken.setToken(rawToken);
        return refreshToken;
    }

    // ── Create with existing familyId (used during rotation) ─────
    public RefreshToken rotateRefreshToken(String userId, List<String> roles, String familyId) {
        String rawToken = UUID.randomUUID().toString();
        String hashedToken = hashToken(rawToken);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setRoles(roles);
        refreshToken.setExpiryDate(new Date(System.currentTimeMillis() + 604800000L));
        refreshToken.setToken(hashedToken);
        refreshToken.setFamilyId(familyId); // ✅ Keep same familyId across rotations
        refreshToken.setReused(false);

        refreshTokenRepository.save(refreshToken);

        refreshToken.setToken(rawToken);
        return refreshToken;
    }

    // ── Find ─────────────────────────────────────────────────────
    public Optional<RefreshToken> findByToken(String rawToken) {
        String hashedToken = hashToken(rawToken);
        return refreshTokenRepository.findByToken(hashedToken);
    }

    // ── Verify expiration ────────────────────────────────────────
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().before(new Date())) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException("Refresh token expired. Please login again.");
        }
        return token;
    }

    // ── Delete single token ───────────────────────────────────────
    public void deleteByToken(String rawToken) {
        String hashedToken = hashToken(rawToken);
        refreshTokenRepository.deleteByToken(hashedToken);
    }

    // ── Delete all tokens for user ───────────────────────────────
    public void deleteByUserId(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    // ── Delete all tokens in a family ────────────────────────────
    public void deleteByFamilyId(String familyId) {
        refreshTokenRepository.deleteByFamilyId(familyId);
    }
}





