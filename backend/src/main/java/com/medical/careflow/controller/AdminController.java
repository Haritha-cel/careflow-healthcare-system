package com.medical.careflow.controller;

import com.medical.careflow.config.JWTTokenHelper;
import com.medical.careflow.exception.BadRequestException;
import com.medical.careflow.exception.ResourceNotFoundException;
import com.medical.careflow.model.Appointment;
import com.medical.careflow.model.Doctor;
import com.medical.careflow.model.Speciality;
import com.medical.careflow.repository.AppointmentsRepository;
import com.medical.careflow.repository.DoctorRepository;
import com.medical.careflow.repository.SpecialityRepository;
import com.medical.careflow.repository.UserDetailRepository;
import com.medical.careflow.service.AdminService;
import com.medical.careflow.service.PushNotificationService;
import com.medical.careflow.util.FileValidationUtil;
import com.medical.careflow.util.InputSanitizer;
import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private DoctorRepository doctorRepository;
    @Autowired private AppointmentsRepository appointmentsRepository;
    @Autowired private UserDetailRepository userRepository;
    @Autowired private JWTTokenHelper jwtTokenHelper;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private Cloudinary cloudinary;
    @Autowired private SpecialityRepository specialityRepository;
    @Autowired private AdminService adminService;
    @Autowired private PushNotificationService pushNotificationService;

    // =========================================
    // 👨‍⚕️ ADD DOCTOR (ADMIN ONLY)
    // =========================================
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/add-doctor")
    public ResponseEntity<?> addDoctor(
            @RequestParam String name,       @RequestParam String email,
            @RequestParam String password,   @RequestParam String speciality,
            @RequestParam String degree,     @RequestParam String experience,
            @RequestParam String about,      @RequestParam Double fees,
            @RequestParam String address,    @RequestParam MultipartFile image
    ) {
        // ✅ Plain text fields — strip all HTML
        name       = InputSanitizer.sanitizePlain(name);
        email      = InputSanitizer.sanitizePlain(email);
        speciality = InputSanitizer.sanitizePlain(speciality);
        degree     = InputSanitizer.sanitizePlain(degree);
        experience = InputSanitizer.sanitizePlain(experience);
        address    = InputSanitizer.sanitizePlain(address);

        // ✅ Rich text field — allows basic formatting tags (b, i, p, br)
        about = InputSanitizer.sanitizeRichText(about);

        try {
            FileValidationUtil.validateImage(image);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(e.getMessage());
        }

        if (name == null || name.isBlank())
            throw new BadRequestException("Name is required");
        if (password == null || password.length() < 8)
            throw new BadRequestException("Password must be at least 8 characters");
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$"))
            throw new BadRequestException("Invalid email format");
        if (fees == null || fees <= 0)
            throw new BadRequestException("Valid fees are required");

        String result = adminService.addDoctor(
                name, email, password, speciality, degree, experience, about, fees, address, image);
        return ResponseEntity.ok(Map.of("success", true, "message", result));
    }

    // =========================================
    // 📋 GET ALL DOCTORS (ADMIN ONLY)
    // =========================================
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/doctor-list")
    public List<Doctor> getAllDoctors() {
        List<Doctor> doctors = adminService.getAllDoctors();
        doctors.forEach(d -> d.setPassword(null));
        return doctors;
    }

    // =========================================
    // 📅 GET ALL APPOINTMENTS (ADMIN ONLY)
    // =========================================
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/all-appointments")
    public List<Appointment> getAllAppointments() {
        return adminService.getAllAppointments();
    }

    // =========================================
    // ❌ CANCEL APPOINTMENT (ADMIN ONLY)
    // =========================================
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/cancel-appointment")
    public ResponseEntity<?> cancelAppointment(@RequestBody Map<String, String> request) {
        String appointmentId = request.get("id");
        if (appointmentId == null || appointmentId.isBlank())
            throw new BadRequestException("Appointment ID is required");

        String result = adminService.cancelAppointment(appointmentId);
        return ResponseEntity.ok(Map.of("success", true, "message", result));
    }

    // =========================================
    // ✅ COMPLETE APPOINTMENT (ADMIN ONLY)
    // =========================================
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/complete-appointment")
    public ResponseEntity<?> completeAppointment(@RequestBody Map<String, String> request) {
        String appointmentId = request.get("id");
        if (appointmentId == null || appointmentId.isBlank())
            throw new BadRequestException("Appointment ID is required");

        String result = adminService.completeAppointment(appointmentId);
        return ResponseEntity.ok(Map.of("success", true, "message", result));
    }

    // =========================================
    // 📊 DASHBOARD (ADMIN ONLY)
    // =========================================
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return adminService.getDashboard();
    }

    // =========================================
    // ➕ ADD SPECIALITY (ADMIN ONLY)
    // =========================================
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/add-speciality")
    public ResponseEntity<?> addSpeciality(@RequestBody Map<String, String> request) {
        String title       = InputSanitizer.sanitizePlain(request.get("title"));
        // ✅ Description may contain basic formatting
        String description = InputSanitizer.sanitizeRichText(request.getOrDefault("description", ""));

        if (title == null || title.isBlank())
            throw new BadRequestException("Title is required");

        Speciality speciality = new Speciality();
        speciality.setTitle(title);
        speciality.setDescription(description);
        specialityRepository.save(speciality);

        return ResponseEntity.ok(Map.of("success", true, "message", "Speciality added successfully"));
    }

    // =========================================
    // ❌ DELETE SPECIALITY (ADMIN ONLY)
    // =========================================
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/delete-speciality/{id}")
    public ResponseEntity<?> deleteSpeciality(@PathVariable String id) {
        specialityRepository.deleteById(InputSanitizer.sanitizePlain(id));
        return ResponseEntity.ok(Map.of("success", true, "message", "Speciality deleted"));
    }

    // =========================================
    // CHANGE DOCTOR-AVAILABILITY
    // =========================================
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/change-availability")
    public ResponseEntity<?> changeDoctorAvailability(@RequestBody Map<String, String> request) {
        String docId = request.get("docId");
        if (docId == null || docId.isBlank())
            throw new BadRequestException("Doctor ID is required");

        Doctor doctor = doctorRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        doctor.setAvailable(!doctor.isAvailable());
        doctorRepository.save(doctor);

        return ResponseEntity.ok(Map.of("success", true, "message", "Availability Updated"));
    }

    // =========================================
    // 🔧 SYNC DATABASE SLOTS (ADMIN ONLY)
    // =========================================
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/sync-doctor-slots")
    public ResponseEntity<?> syncDoctorSlots() {
        String result = adminService.syncAllDoctorSlots();
        return ResponseEntity.ok(Map.of("success", true, "message", result));
    }
}