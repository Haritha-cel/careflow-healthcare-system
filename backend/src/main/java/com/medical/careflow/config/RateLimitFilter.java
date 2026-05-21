package com.medical.careflow.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, RateLimitEntry> loginAttempts = new ConcurrentHashMap<>();

    private static final int MAX_ATTEMPTS = 15;
    private static final long WINDOW_MS = 15 * 60 * 1000; // 15 minutes

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.contains("/login") || path.contains("/auth/clerk-verify")) {

            // ✅ IP + URI key: each endpoint has its own independent counter.
            // Hammering /admin/login doesn't exhaust the /clerk-verify budget.
            String key = getRateLimitKey(request);
            RateLimitEntry entry = loginAttempts.computeIfAbsent(key, k -> new RateLimitEntry());

            synchronized (entry) {
                long now = System.currentTimeMillis();

                if (now - entry.lastResetTime > WINDOW_MS) {
                    entry.count.set(0);
                    entry.lastResetTime = now;
                }

                if (entry.count.incrementAndGet() > MAX_ATTEMPTS) {
                    response.setStatus(429);
                    response.setContentType("application/json");
                    response.getWriter().write(
                            "{\"success\":false,\"message\":\"Too many attempts. Try again later.\"}"
                    );
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    // ✅ Per-endpoint key — IP + URI
    private String getRateLimitKey(HttpServletRequest request) {
        return getClientIp(request) + ":" + request.getRequestURI();
    }

    // ✅ Public — AuthController calls this on successful login to clear the counter
    public void clearLoginAttempts(HttpServletRequest request) {
        // ✅ Must clear using the same key format used when counting
        String key = getRateLimitKey(request);
        loginAttempts.remove(key);
    }

    // ✅ Only trust X-Forwarded-For from known internal proxies/load balancers.
    // If this server is directly internet-facing, X-Forwarded-For is spoofable — ignore it.
    public String getClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();

        if (isTrustedProxy(remoteAddr)) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim(); // leftmost = real client IP
            }
        }

        return remoteAddr;
    }

    // ✅ Replace these with your actual load balancer / reverse proxy IPs if you have one.
    // If deploying on Railway / Render / Fly.io etc, check their docs for the proxy IP range.
    private boolean isTrustedProxy(String remoteAddr) {
        return remoteAddr.equals("127.0.0.1") ||
                remoteAddr.equals("::1") ||           // IPv6 localhost
                remoteAddr.startsWith("10.") ||        // private class A
                remoteAddr.startsWith("172.16.") ||    // private class B
                remoteAddr.startsWith("192.168.");     // private class C
    }

    private static class RateLimitEntry {
        AtomicInteger count = new AtomicInteger(0);
        long lastResetTime = System.currentTimeMillis();
    }
}