package com.medical.careflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentDto {

    private String id;

    private String doctorId;
    private String doctorName;

    private String userId;
    private String userName;

    private String status; // General status string (e.g., "CONFIRMED")

    private String slotDate;
    private String slotTime;

    private Double amount;

    // ✅ NEW FIELDS FOR PAYMENT LOGIC
    private String paymentMethod; // "online" | "cash"
    private String paymentStatus; // "paid" | "pending"

    // ✅ NEW FIELDS FOR REMINDER LOGIC
    private Integer reminderMinutes; // 15, 30, 45, 60

    // ✅ NEW FIELDS FOR APPOINTMENT STATE
    private Boolean cancelled;
    private Boolean completed;
}