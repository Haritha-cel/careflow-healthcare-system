package com.medical.careflow.controller;

import com.medical.careflow.exception.BadRequestException;
import com.medical.careflow.exception.ResourceNotFoundException;
import com.medical.careflow.model.Appointment;
import com.medical.careflow.model.Doctor;
import com.medical.careflow.repository.DoctorRepository;
import com.medical.careflow.repository.AppointmentsRepository;
import com.medical.careflow.util.InputSanitizer;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions; // ✅ NEW IMPORT: For thread-safe API calls
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentsRepository appointmentsRepository;

    @PreAuthorize("hasAuthority('PATIENT')")
    @PostMapping("/create-intent")
    public ResponseEntity<?> createPaymentIntent(
            @RequestAttribute("userId") String userId,
            @RequestBody Map<String, String> request) {

        String doctorId = request.get("doctorId");
        String appointmentId = request.get("appointmentId");
        String currency = request.getOrDefault("currency", "usd");

        if (doctorId == null || doctorId.isBlank()) throw new BadRequestException("Doctor ID is required");
        if (appointmentId == null || appointmentId.isBlank()) throw new BadRequestException("Appointment ID is required");

        doctorId = InputSanitizer.sanitizePlain(doctorId);
        appointmentId = InputSanitizer.sanitizePlain(appointmentId);

        // SECURITY: Verify this appointment actually belongs to this user!
        Appointment appointment = appointmentsRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        if (!appointment.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized: Appointment does not belong to you");
        }

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (doctor.getFees() == null || doctor.getFees() <= 0) throw new BadRequestException("Invalid fees");

        long amount = (long) (doctor.getFees() * 100);

        // ✅✅✅ CRITICAL FIX: Thread-Safe Stripe API Call ✅✅✅
        // Removed: Stripe.apiKey = stripeSecretKey; (This is a static variable and is NOT thread-safe)
        RequestOptions requestOptions = RequestOptions.builder()
                .setApiKey(stripeSecretKey)
                .build();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .putMetadata("doctorId", doctorId)
                .putMetadata("patientId", userId)
                .putMetadata("appointmentId", appointmentId)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                )
                .build();

        try {
            // ✅ Pass the request-specific options instead of relying on static config
            PaymentIntent intent = PaymentIntent.create(params, requestOptions);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "clientSecret", intent.getClientSecret(),
                    "amount", String.valueOf(amount)
            ));
        } catch (Exception e) {
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }
}