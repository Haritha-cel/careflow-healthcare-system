package com.medical.careflow.controller;

import com.medical.careflow.model.Appointment;
import com.medical.careflow.repository.AppointmentsRepository;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
public class StripeWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(StripeWebhookController.class);

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    // ✅ FIX: Removed @Value("${stripe.secret.key}"). We no longer need it here
    // because we removed the redundant charge.succeeded network call.

    @Autowired
    private AppointmentsRepository appointmentsRepository;

    // =========================================
    // 🔔 STRIPE WEBHOOK (Called by Stripe Servers)
    // =========================================
    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        logger.info("🔔 Received Stripe Webhook request");

        // STEP 1: VERIFY SIGNATURE
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            logger.error("❌ Webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        // STEP 2: PROCESS THE EVENT
        String eventType = event.getType();
        logger.info("ℹ️ Processing event type: {}", eventType);

        // ✅ FIX: Simplified to ONLY listen to payment_intent.succeeded.
        // This event contains all the metadata we need and prevents duplicate processing
        // and race conditions that were happening by also listening to charge.succeeded.
        if ("payment_intent.succeeded".equals(eventType)) {
            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
            StripeObject stripeObject = deserializer.getObject().orElse(null);

            if (stripeObject instanceof PaymentIntent) {
                PaymentIntent intent = (PaymentIntent) stripeObject;
                processSuccessfulPayment(intent.getId(), intent.getMetadata().get("appointmentId"));
            }
        }

        // Stripe requires a 200 OK response to acknowledge receipt
        return ResponseEntity.ok("Success");
    }

    // ✅ HELPER: Process the payment and update DB (Prevents duplicate code)
    private void processSuccessfulPayment(String paymentIntentId, String appointmentId) {
        if (appointmentId == null || appointmentId.isEmpty()) {
            logger.warn("⚠️ Webhook received without appointmentId in metadata for PI: {}", paymentIntentId);
            return;
        }

        Optional<Appointment> apptOpt = appointmentsRepository.findById(appointmentId);

        if (apptOpt.isPresent()) {
            Appointment appointment = apptOpt.get();

            // Idempotency check: Only update if it's not already paid
            if (!"paid".equals(appointment.getPaymentStatus())) {
                appointment.setPaymentMethod("online");
                appointment.setPaymentStatus("paid");
                appointment.setPayment(true);
                appointmentsRepository.save(appointment);
                logger.info("💾 Appointment {} marked as PAID via Stripe", appointmentId);
            } else {
                logger.info("ℹ️ Appointment {} was already marked as paid", appointmentId);
            }
        } else {
            logger.warn("⚠️ Webhook received for non-existent appointment: {}", appointmentId);
        }
    }
}