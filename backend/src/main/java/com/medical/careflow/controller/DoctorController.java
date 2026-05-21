package com.medical.careflow.controller;

import com.medical.careflow.exception.BadRequestException;
import com.medical.careflow.exception.ResourceNotFoundException;
import com.medical.careflow.model.Doctor;
import com.medical.careflow.repository.DoctorRepository;
import com.medical.careflow.service.DoctorService;
import com.medical.careflow.util.InputSanitizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/doctor")
// ✅ FIX: Removed @CrossOrigin(origins = "*"). Handled securely by WebSecurityConfig.
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DoctorService doctorService;

    // =========================================
    // 📋 DOCTOR LIST (PUBLIC)
    // =========================================
    @GetMapping("/list")
    public Map<String, Object> doctorList() {
        List<Doctor> doctors = doctorRepository.findAll()
                .stream()
                .peek(d -> { d.setPassword(null); d.setEmail(null); })
                .toList();
        return Map.of("success", true, "doctors", doctors);
    }

    // =========================================
    // ✅ GET SINGLE DOCTOR DETAILS (PUBLIC)
    // =========================================
    @GetMapping("/details/{id}")
    public Map<String, Object> getDoctorDetails(@PathVariable String id) {
        Doctor doctor = doctorRepository.findById(InputSanitizer.sanitizePlain(id))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        doctor.setPassword(null);

        return Map.of("success", true, "doctor", doctor);
    }

    // =========================================
    // 📅 GET APPOINTMENTS
    // =========================================
    @PreAuthorize("hasAuthority('DOCTOR')")
    @GetMapping("/appointments")
    public Map<String, Object> getAppointments(@RequestAttribute("doctorId") String doctorId) {
        return Map.of("success", true, "appointments", doctorService.getAppointments(doctorId));
    }

    // =========================================
    // ✅ COMPLETE APPOINTMENT (Secured)
    // =========================================
    @PreAuthorize("hasAuthority('DOCTOR')")
    @PostMapping("/complete")
    public ResponseEntity<?> completeAppointment(
            @RequestAttribute("doctorId") String doctorId,
            @RequestBody Map<String, String> request) {

        String appointmentId = request.get("appointmentId");
        if (appointmentId == null || appointmentId.isBlank()) {
            throw new BadRequestException("Appointment ID is required");
        }

        String result = doctorService.completeAppointment(doctorId, InputSanitizer.sanitizePlain(appointmentId));
        return ResponseEntity.ok(Map.of("success", true, "message", result));
    }

    // =========================================
    // ❌ CANCEL APPOINTMENT (Secured)
    // =========================================
    @PreAuthorize("hasAuthority('DOCTOR')")
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelAppointment(
            @RequestAttribute("doctorId") String doctorId,
            @RequestBody Map<String, String> request) {

        String appointmentId = request.get("appointmentId");
        if (appointmentId == null || appointmentId.isBlank()) {
            throw new BadRequestException("Appointment ID is required");
        }

        String result = doctorService.cancelAppointment(doctorId, InputSanitizer.sanitizePlain(appointmentId));
        return ResponseEntity.ok(Map.of("success", true, "message", result));
    }

    // =========================================
    // 🔁 CHANGE AVAILABILITY
    // =========================================
    @PreAuthorize("hasAuthority('DOCTOR')")
    @PostMapping("/change-availability")
    public ResponseEntity<?> changeAvailability(@RequestAttribute("doctorId") String doctorId) {
        String result = doctorService.changeAvailability(doctorId);
        return ResponseEntity.ok(Map.of("success", true, "message", result));
    }

    // =========================================
    // 📊 DASHBOARD
    // =========================================
    @PreAuthorize("hasAuthority('DOCTOR')")
    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(@RequestAttribute("doctorId") String doctorId) {
        return Map.of("success", true, "dashData", doctorService.getDashboard(doctorId));
    }

    // =========================================
    // 👤 PROFILE
    // =========================================
    @PreAuthorize("hasAuthority('DOCTOR')")
    @GetMapping("/profile")
    public ResponseEntity<?> profile(@RequestAttribute("doctorId") String doctorId) {
        return ResponseEntity.ok(Map.of("success", true, "profileData", doctorService.getProfile(doctorId)));
    }

    // =========================================
    // ✏️ UPDATE PROFILE (Secured & Fixed Address)
    // =========================================
    @PreAuthorize("hasAuthority('DOCTOR')")
    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(
            @RequestAttribute("doctorId") String doctorId,
            @RequestBody Map<String, Object> request) {

        Double fees = null;
        Boolean available = null;
        Map<String, Object> address = null; // ✅ NEW: Prepare address variable

        if (request.containsKey("fees") && request.get("fees") != null) {
            try {
                fees = Double.parseDouble(request.get("fees").toString());
                if (fees < 0) {
                    throw new BadRequestException("Fees cannot be negative");
                }
            } catch (NumberFormatException e) {
                throw new BadRequestException("Invalid fees value");
            }
        }

        if (request.containsKey("available") && request.get("available") != null) {
            available = Boolean.parseBoolean(request.get("available").toString());
        }

        // ✅ FIX: Extract address map from the request body
        if (request.containsKey("address") && request.get("address") instanceof Map) {
            address = (Map<String, Object>) request.get("address");
        }

        // ✅ FIX: Pass the address to the DoctorService
        String result = doctorService.updateProfile(doctorId, fees, available, address);
        return ResponseEntity.ok(Map.of("success", true, "message", result));
    }
}