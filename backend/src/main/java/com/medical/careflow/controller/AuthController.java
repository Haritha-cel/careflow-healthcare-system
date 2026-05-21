package com.medical.careflow.controller;

import com.medical.careflow.config.JWTTokenHelper;
import com.medical.careflow.config.RateLimitFilter;
import com.medical.careflow.dto.GoogleLoginRequest;
import com.medical.careflow.dto.SignInRequest;
import com.medical.careflow.exception.BadRequestException;
import com.medical.careflow.model.RefreshToken;
import com.medical.careflow.service.RefreshTokenService;
import com.medical.careflow.service.CustomUserDetailService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    // Set to false in dev, true in prod (requires HTTPS)
    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    @Autowired private CustomUserDetailService userDetailsService;
    @Autowired private JWTTokenHelper jwtTokenHelper;
    @Autowired private RefreshTokenService refreshTokenService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private RateLimitFilter rateLimitFilter;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPasswordHash;

    // ─────────────────────────────────────────
    // 🍪 Cookie helpers
    // ─────────────────────────────────────────

    private void setTokenCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        // Access token — 15 minutes, sent on every request
        Cookie accessCookie = new Cookie("accessToken", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(cookieSecure);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(15 * 60);
        response.addCookie(accessCookie);

        // Refresh token — 7 days, scoped to refresh endpoint only
        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(cookieSecure);
        refreshCookie.setPath("/api/auth/refresh"); // ✅ browser only sends it here
        refreshCookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(refreshCookie);
    }

    private void clearTokenCookies(HttpServletResponse response) {
        Cookie access = new Cookie("accessToken", "");
        access.setHttpOnly(true);
        access.setPath("/");
        access.setMaxAge(0);
        response.addCookie(access);

        Cookie refresh = new Cookie("refreshToken", "");
        refresh.setHttpOnly(true);
        refresh.setPath("/api/auth/refresh");
        refresh.setMaxAge(0);
        response.addCookie(refresh);
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if ("refreshToken".equals(c.getName())) return c.getValue();
        }
        return null;
    }

    // =========================================
    // ✅ SESSION VERIFY — rehydrates React state after hard refresh
    // JWTAuthenticationFilter already ran; if we reach here the token is valid.
    // =========================================
    @GetMapping("/verify")
    public ResponseEntity<?> verify() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new BadRequestException("Not authenticated");
        }
        List<String> roles = auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "userId", auth.getName(),
                "roles", roles
        ));
    }

    // =========================================
    // ✅ PATIENT CLERK LOGIN
    // =========================================
    @PostMapping("/clerk-verify")
    public ResponseEntity<?> clerkLogin(@RequestBody Map<String, String> request,
                                        HttpServletRequest httpRequest,
                                        HttpServletResponse response) {
        String clerkToken = request.get("token");
        if (clerkToken == null || clerkToken.isEmpty()) throw new BadRequestException("Clerk token is missing");

        Map<String, Object> result = userDetailsService.handleClerkLogin(clerkToken);
        String userId = (String) result.get("id");

        String accessToken = jwtTokenHelper.generateToken(userId, List.of("PATIENT"));
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userId, List.of("PATIENT"));

        // ✅ Set HttpOnly cookie for web admin panel (ignored by mobile, mobile has no cookie jar)
        setTokenCookies(response, accessToken, refreshToken.getToken());
        rateLimitFilter.clearLoginAttempts(httpRequest);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "sessionMarker", "PATIENT",   // web reads this
                "role", "patient",            // ✅ mobile reads this — was removed, now restored
                "accessToken", accessToken,   // ✅ mobile needs token in body (no cookie jar)
                "refreshToken", refreshToken.getToken(), // ✅ mobile needs this too
                "user", result
        ));
    }

    // =========================================
    // ✅ PATIENT: GOOGLE LOGIN
    // =========================================
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request,
                                         HttpServletRequest httpRequest,
                                         HttpServletResponse response) {
        Map<String, Object> result = userDetailsService.handleGoogleLogin(request.getIdToken());
        String userId = (String) result.get("id");

        String accessToken = jwtTokenHelper.generateToken(userId, List.of("PATIENT"));
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userId, List.of("PATIENT"));

        setTokenCookies(response, accessToken, refreshToken.getToken());
        rateLimitFilter.clearLoginAttempts(httpRequest);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "sessionMarker", "PATIENT",
                "role", "patient",            // ✅ mobile reads this
                "accessToken", accessToken,   // ✅ mobile needs token in body
                "refreshToken", refreshToken.getToken(),
                "user", result
        ));
    }

    // =========================================
    // ✅ DOCTOR LOGIN
    // =========================================
    @PostMapping("/doctor/login")
    public ResponseEntity<?> doctorLogin(@Valid @RequestBody SignInRequest request,
                                         HttpServletRequest httpRequest,
                                         HttpServletResponse response) {
        Map<String, Object> result = userDetailsService.handleDoctorLogin(request.getEmail(), request.getPassword());
        String doctorId = (String) result.get("id");

        String accessToken = jwtTokenHelper.generateToken(doctorId, List.of("DOCTOR"));
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(doctorId, List.of("DOCTOR"));

        setTokenCookies(response, accessToken, refreshToken.getToken());
        rateLimitFilter.clearLoginAttempts(httpRequest);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "sessionMarker", "DOCTOR",
                "role", "doctor",             // ✅ mobile reads this
                "accessToken", accessToken,   // ✅ mobile needs token in body
                "refreshToken", refreshToken.getToken(),
                "doctor", result
        ));
    }

    // =========================================
    // ✅ ADMIN LOGIN
    // =========================================
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody SignInRequest request,
                                        HttpServletRequest httpRequest,
                                        HttpServletResponse response) {
        boolean emailMatches = adminEmail.equals(request.getEmail());
        // Only run bcrypt if email matched — avoid wasting CPU on clearly wrong attempts
        boolean passwordMatches = emailMatches &&
                passwordEncoder.matches(request.getPassword(), adminPasswordHash);

        if (emailMatches && passwordMatches) {
            String accessToken = jwtTokenHelper.generateToken(request.getEmail(), List.of("ADMIN"));
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(request.getEmail(), List.of("ADMIN"));

            setTokenCookies(response, accessToken, refreshToken.getToken());
            rateLimitFilter.clearLoginAttempts(httpRequest);
            logger.info("Admin login successful: {}", request.getEmail());

            return ResponseEntity.ok(Map.of("success", true, "sessionMarker", "ADMIN"));

        } else {
            String ip = httpRequest.getRemoteAddr();
            logger.warn("Failed admin login from IP {} for email: {}", ip, request.getEmail());
            try { Thread.sleep(1000); } catch (InterruptedException ignored) {} // blunt brute-force
            throw new BadRequestException("Invalid Admin Credentials");
        }
    }

    // =========================================
    // 🔄 REFRESH — reads refresh token from HttpOnly cookie
    // =========================================
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest httpRequest,
                                          HttpServletResponse response) {
        String requestToken = extractRefreshCookie(httpRequest);

        if (requestToken == null || requestToken.isEmpty()) {
            throw new BadRequestException("Refresh token missing");
        }

        RefreshToken dbToken = refreshTokenService.findByToken(requestToken)
                .orElseThrow(() -> {
                    logger.warn("Refresh token not found — possible replay attack from IP: {}",
                            httpRequest.getRemoteAddr());
                    return new BadRequestException("Invalid refresh token");
                });

        if (dbToken.isReused()) {
            logger.warn("TOKEN REPLAY DETECTED for user {}! Invalidating family {}",
                    dbToken.getUserId(), dbToken.getFamilyId());
            refreshTokenService.deleteByFamilyId(dbToken.getFamilyId());
            clearTokenCookies(response);
            throw new BadRequestException("Token replay detected. Please login again.");
        }

        refreshTokenService.verifyExpiration(dbToken);

        List<String> roles = dbToken.getRoles();
        String familyId = dbToken.getFamilyId();

        dbToken.setReused(true);
        refreshTokenService.deleteByToken(requestToken);

        String newAccessToken = jwtTokenHelper.generateToken(dbToken.getUserId(), roles);
        RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(dbToken.getUserId(), roles, familyId);

        setTokenCookies(response, newAccessToken, newRefreshToken.getToken());
        rateLimitFilter.clearLoginAttempts(httpRequest);

        return ResponseEntity.ok(Map.of("success", true));
    }

    // =========================================
    // 🚪 LOGOUT — clears cookie + invalidates DB token
    // =========================================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest httpRequest, HttpServletResponse response) {
        String requestToken = extractRefreshCookie(httpRequest);

        if (requestToken != null && !requestToken.isEmpty()) {
            refreshTokenService.deleteByToken(requestToken);
        }

        clearTokenCookies(response);
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }
}