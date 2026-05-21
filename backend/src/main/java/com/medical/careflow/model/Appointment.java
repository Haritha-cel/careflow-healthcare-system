package com.medical.careflow.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "appointments")
public class Appointment {
    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String doctorId;

    @Indexed
    private Long date;

    private String slotDate;
    private String slotTime;
    private Double amount;

    // --- PAYMENT FIELDS ---
    private String paymentMethod; // "online" | "cash"
    private String paymentStatus; // "paid" | "pending"

    private Integer reminderMinutes;

    // ✅ FIX: Changed to primitive 'boolean' to prevent NullPointerExceptions
    @Indexed
    @Builder.Default
    private boolean cancelled = false;

    @Indexed
    @Builder.Default
    private boolean completed = false;

    // ✅ FIX: Changed to primitive 'boolean'
    @Builder.Default
    private boolean payment = false;

    // Embedded data (Denormalization for performance)
    private Map<String, Object> userData;
    private Map<String, Object> docData;
}