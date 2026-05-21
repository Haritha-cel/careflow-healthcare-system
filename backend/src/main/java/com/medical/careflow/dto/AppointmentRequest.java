package com.medical.careflow.dto;

import lombok.Data;

@Data
public class AppointmentRequest {
    private String doctorId;
    private String slotDate;
    private String slotTime;

    // ✅ NEW FIELDS
    private Integer reminderMinutes; // 15, 30, 45, 60 (from frontend)
    private String paymentMethod;   // "online" | "cash"
    private String paymentStatus;   // "paid" | "pending"
}