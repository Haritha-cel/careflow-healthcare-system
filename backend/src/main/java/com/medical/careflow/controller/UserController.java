package com.medical.careflow.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medical.careflow.dto.AppointmentRequest; // ✅ NEW IMPORT
import com.medical.careflow.exception.BadRequestException;
import com.medical.careflow.exception.ResourceNotFoundException; // ✅ NEW IMPORT
import com.medical.careflow.model.*;
import com.medical.careflow.repository.*;
import com.medical.careflow.config.JWTTokenHelper;
import com.medical.careflow.util.FileValidationUtil;
import com.medical.careflow.util.InputSanitizer;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid; // ✅ NEW IMPORT
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/user")
// ✅ FIX: Removed @CrossOrigin(origins = "*"). Handled securely by WebSecurityConfig.
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserDetailRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentsRepository appointmentsRepository;

    @Autowired
    private JWTTokenHelper jwtTokenHelper;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private MongoTemplate mongoTemplate;

    // =========================================
    // PROFILE
    // =========================================
    @PreAuthorize("hasAuthority('PATIENT')")
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestAttribute("userId") String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")); // ✅ FIX: Custom Exception

        user.setPassword(null);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "userData", user
        ));
    }

    // =========================================
    // 🔥 UPDATE PROFILE (Secured)
    // =========================================
    @PreAuthorize("hasAuthority('PATIENT')")
    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(
            @RequestAttribute("userId") String userId,
            @RequestParam String name,
            @RequestParam String phone,
            @RequestParam String address,
            @RequestParam String dob,
            @RequestParam String gender,
            @RequestParam(required = false) MultipartFile image
    ) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found")); // ✅ FIX

            user.setName(InputSanitizer.sanitizePlain(name));
            user.setPhone(InputSanitizer.sanitizePlain(phone));
            user.setDob(InputSanitizer.sanitizePlain(dob));
            user.setGender(InputSanitizer.sanitizePlain(gender));

            if (phone != null && !phone.isBlank()) {
                String cleanPhone = phone.replaceAll("[\\s\\-\\(\\)]", "");
                if (!cleanPhone.matches("^\\+?[0-9]{7,15}$")) {
                    throw new BadRequestException("Invalid phone number format"); // ✅ FIX: Throw instead of return
                }
            }

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> addressMap = mapper.readValue(address, Map.class);
            user.setAddress(addressMap);

            if (image != null && !image.isEmpty()) {
                try {
                    FileValidationUtil.validateImage(image);
                } catch (IllegalArgumentException e) {
                    throw new BadRequestException(e.getMessage()); // ✅ FIX
                }

                if (user.getImagePublicId() != null && !user.getImagePublicId().isEmpty()) {
                    try {
                        cloudinary.uploader().destroy(user.getImagePublicId(), ObjectUtils.emptyMap());
                        logger.info("Deleted old image: {}", user.getImagePublicId());
                    } catch (Exception e) {
                        logger.warn("Failed to delete old image: {}", e.getMessage());
                    }
                }

                Map uploadResult = cloudinary.uploader().upload(
                        image.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "careflow_profiles",
                                "width", 500,
                                "height", 500,
                                "crop", "fill"
                        )
                );

                String imageUrl = (String) uploadResult.get("secure_url");
                String publicId = (String) uploadResult.get("public_id");

                user.setImage(imageUrl);
                user.setImagePublicId(publicId);
            }

            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile Updated"
            ));

        } catch (Exception e) {
            logger.error("Profile update failed for userId {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Profile update failed. Please try again."); // Handled by GlobalExceptionHandler
        }
    }

    // =========================================
    // 🔥 BOOK APPOINTMENT (Secured - DTO & Payment Bypass Fix)
    // =========================================
    @PreAuthorize("hasAuthority('PATIENT')")
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(
            @RequestAttribute("userId") String userId,
            @Valid @RequestBody AppointmentRequest request) { // ✅ FIX: Using DTO!

        try {
            String doctorId = InputSanitizer.sanitizePlain(request.getDoctorId());
            String slotDate = InputSanitizer.sanitizePlain(request.getSlotDate());
            String slotTime = InputSanitizer.sanitizePlain(request.getSlotTime());

            if (!slotDate.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
                throw new BadRequestException("Invalid date format");
            }

            if (!slotTime.matches("^\\d{1,2}:\\d{2}(\\s?(AM|PM|am|pm))?$")) {
                throw new BadRequestException("Invalid time format");
            }

            String paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : "cash";
            String paymentStatus = request.getPaymentStatus() != null ? request.getPaymentStatus() : "pending";

            if (!List.of("cash", "online").contains(paymentMethod)) {
                throw new BadRequestException("Invalid payment method");
            }

            // ✅✅✅ CRITICAL SECURITY FIX: PAYMENT BYPASS PREVENTION ✅✅✅
            // If payment method is online, it MUST be pending.
            // Only the Stripe Webhook is allowed to set this to "paid"!
            if ("online".equals(paymentMethod)) {
                paymentStatus = "pending";
            }

            Integer reminderMinutes = request.getReminderMinutes();
            if (reminderMinutes != null) {
                if (reminderMinutes < 0) reminderMinutes = 0;
                if (reminderMinutes > 10080) reminderMinutes = 10080;
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

            if (!doctor.isAvailable()) {
                throw new BadRequestException("Doctor is not available for booking");
            }

            // ATOMIC CHECK-AND-BOOK
            Query atomicQuery = new Query(Criteria.where("_id").is(doctorId)
                    .and("slots_booked." + slotDate).ne(slotTime));

            String dynamicField = "slots_booked." + slotDate;
            Update atomicUpdate = new Update().addToSet(dynamicField, slotTime);

            Doctor originalDoctor = mongoTemplate.findAndModify(
                    atomicQuery,
                    atomicUpdate,
                    org.springframework.data.mongodb.core.FindAndModifyOptions.options().returnNew(false),
                    Doctor.class
            );

            if (originalDoctor == null) {
                throw new ResourceNotFoundException("Doctor not found");
            }

            Map<String, List<String>> originalSlots = originalDoctor.getSlotsBooked();
            if (originalSlots != null
                    && originalSlots.containsKey(slotDate)
                    && originalSlots.get(slotDate).contains(slotTime)) {
                throw new BadRequestException("Sorry, this slot was just booked by someone else.");
            }

            // Slot claimed — create appointment
            Appointment appointment = new Appointment();
            appointment.setUserId(userId);
            appointment.setDoctorId(doctorId);
            appointment.setSlotDate(slotDate);
            appointment.setSlotTime(slotTime);
            appointment.setAmount(doctor.getFees());
            appointment.setDate(System.currentTimeMillis());

            appointment.setPaymentMethod(paymentMethod);
            appointment.setPaymentStatus(paymentStatus); // Safely set now
            appointment.setPayment("paid".equals(paymentStatus));

            appointment.setReminderMinutes(reminderMinutes);

            // Map userData
            Map<String, Object> userData = new HashMap<>();
            userData.put("_id", user.getId());
            userData.put("name", InputSanitizer.sanitizePlain(user.getName()));
            userData.put("email", user.getEmail());
            userData.put("image", user.getImage() != null ? user.getImage() : "");
            userData.put("phone", user.getPhone() != null ? user.getPhone() : "");
            userData.put("gender", user.getGender() != null ? user.getGender() : "");
            userData.put("dob", user.getDob() != null ? user.getDob() : "");
            userData.put("address", user.getAddress() != null ? user.getAddress() : Map.of());
            appointment.setUserData(userData);

            // Map docData
            Map<String, Object> docData = new HashMap<>();
            docData.put("_id", doctor.getId());
            docData.put("name", InputSanitizer.sanitizePlain(doctor.getName()));
            docData.put("email", doctor.getEmail());
            docData.put("image", doctor.getImage() != null ? doctor.getImage() : "");
            docData.put("speciality", InputSanitizer.sanitizePlain(doctor.getSpeciality()));
            docData.put("degree", doctor.getDegree() != null ? doctor.getDegree() : "");
            docData.put("experience", doctor.getExperience() != null ? doctor.getExperience() : "");
            docData.put("about", InputSanitizer.sanitize(doctor.getAbout() != null ? doctor.getAbout() : ""));
            docData.put("fees", doctor.getFees());
            docData.put("address", doctor.getAddress() != null ? doctor.getAddress() : Map.of());
            appointment.setDocData(docData);

            appointmentsRepository.save(appointment);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Appointment Booked",
                    "appointmentId", appointment.getId()
            ));

        } catch (Exception e) {
            logger.error("Appointment booking failed for userId {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Booking failed. Please try again.");
        }
    }

    // =========================================
    // ❌ CANCEL APPOINTMENT (Secured)
    // =========================================
    @PreAuthorize("hasAuthority('PATIENT')")
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelAppointment(
            @RequestAttribute("userId") String userId,
            @RequestBody Map<String, String> request) {

        try {
            String appointmentId = request.get("appointmentId");
            if (appointmentId == null || appointmentId.isBlank()) {
                throw new BadRequestException("Appointment ID is required");
            }

            Appointment appointment = appointmentsRepository.findById(appointmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

            if (appointment.isCancelled()) {
                throw new BadRequestException("Appointment is already cancelled");
            }

            if (!appointment.getUserId().equals(userId)) {
                throw new BadRequestException("Unauthorized"); // Throw instead of returning 403 directly
            }

            appointment.setCancelled(true);
            appointmentsRepository.save(appointment);

            // RELEASE THE SLOT BACK TO THE DOCTOR
            Query query = new Query(Criteria.where("_id").is(appointment.getDoctorId()));
            String dynamicField = "slots_booked." + appointment.getSlotDate();

            Update update = new Update().pull(dynamicField, appointment.getSlotTime());
            mongoTemplate.updateFirst(query, update, Doctor.class);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Appointment Cancelled"
            ));

        } catch (Exception e) {
            logger.error("Cancel appointment failed for userId {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Cancellation failed. Please try again.");
        }
    }

    // =========================================
    // GET APPOINTMENT BY ID
    // =========================================
    @PreAuthorize("hasAuthority('PATIENT')")
    @GetMapping("/appointment/{id}")
    public ResponseEntity<?> getAppointmentById(
            @RequestAttribute("userId") String userId,
            @PathVariable String id) {

        Appointment appointment = appointmentsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized");
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "appointment", appointment
        ));
    }

    // =========================================
    // LIST APPOINTMENTS
    // =========================================
    @PreAuthorize("hasAuthority('PATIENT')")
    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "appointments", appointmentsRepository.findByUserId(userId)
        ));
    }

    // =========================================
    // 🔥 REMOVE PROFILE IMAGE
    // =========================================
    @PreAuthorize("hasAuthority('PATIENT')")
    @DeleteMapping("/remove-profile-image")
    public ResponseEntity<?> removeProfileImage(@RequestAttribute("userId") String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (user.getImagePublicId() != null && !user.getImagePublicId().isEmpty()) {
                try {
                    cloudinary.uploader().destroy(
                            user.getImagePublicId(),
                            ObjectUtils.emptyMap()
                    );
                    logger.info("Deleted profile image for userId: {}", userId);
                } catch (Exception e) {
                    logger.warn("Cloudinary delete failed: {}", e.getMessage());
                }
            }

            user.setImage(null);
            user.setImagePublicId(null);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile image removed"
            ));

        } catch (Exception e) {
            logger.error("Remove profile image failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to remove profile image");
        }
    }

    // =========================================
    // 🔔 REGISTER PUSH TOKEN
    // =========================================
    @PreAuthorize("hasAuthority('PATIENT')")  // ✅ add auth guard — was missing
    @PostMapping("/push-token")
    public ResponseEntity<?> savePushToken(
            @RequestAttribute("userId") String userId,  // ✅ consistent with all other endpoints
            @RequestBody Map<String, String> body) {

        String pushToken = body.get("pushToken");

        if (pushToken == null || pushToken.isEmpty()) {
            throw new BadRequestException("Push token is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setExpoPushToken(pushToken);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("success", true));
    }
}