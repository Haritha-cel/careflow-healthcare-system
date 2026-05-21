package com.medical.careflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID Token is required")
    private String idToken; // ✅ SECURE: We only accept the encrypted token from the frontend now
}