package com.medical.careflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medical.careflow.exception.BadRequestException;
import com.medical.careflow.exception.ResourceNotFoundException;
import com.medical.careflow.model.Appointment;
import com.medical.careflow.model.Doctor;
import com.medical.careflow.model.User;
import com.medical.careflow.repository.AppointmentsRepository;
import com.medical.careflow.repository.DoctorRepository;
import com.medical.careflow.repository.UserDetailRepository;
import com.cloudinary.Cloudinary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    private final DoctorRepository doctorRepository;
    private final AppointmentsRepository appointmentsRepository;
    private final UserDetailRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Cloudinary cloudinary;
    private final MongoTemplate mongoTemplate;
    private final PushNotificationService pushNotificationService;

    public AdminService(DoctorRepository doctorRepository,
                        AppointmentsRepository appointmentsRepository,
                        UserDetailRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        Cloudinary cloudinary,
                        MongoTemplate mongoTemplate,
                        PushNotificationService pushNotificationService) {
        this.doctorRepository = doctorRepository;
        this.appointmentsRepository = appointmentsRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.cloudinary = cloudinary;
        this.mongoTemplate = mongoTemplate;
        this.pushNotificationService = pushNotificationService;
    }

    // =========================================
    // 🔥 ADD DOCTOR (Secured)
    // =========================================
    public String addDoctor(String name, String email, String password,
                            String speciality, String degree,
                            String experience, String about,
                            Double fees, String address,
                            MultipartFile image) {

        if (doctorRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("Doctor with this email already exists");
        }

        String hashedPassword = passwordEncoder.encode(password);

        try {
            Map upload = cloudinary.uploader().upload(
                    image.getBytes(),
                    Map.of("resource_type", "image")
            );
            String imageUrl = upload.get("secure_url").toString();

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> addressMap = mapper.readValue(address, Map.class);

            Doctor doctor = new Doctor();
            doctor.setName(name);
            doctor.setEmail(email);
            doctor.setPassword(hashedPassword);
            doctor.setImage(imageUrl);
            doctor.setSpeciality(speciality);
            doctor.setDegree(degree);
            doctor.setExperience(experience);
            doctor.setAbout(about);
            doctor.setFees(fees);
            doctor.setAddress(addressMap);
            doctor.setAvailable(true);

            doctorRepository.save(doctor);

            return "Doctor added successfully";

        } catch (Exception e) {
            logger.error("Failed to add doctor {}: {}", name, e.getMessage(), e);
            throw new RuntimeException("Failed to add doctor due to an internal error");
        }
    }

    // =========================================
    // 📋 GET DOCTORS
    // =========================================
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll()
                .stream()
                .peek(doc -> doc.setPassword(null))
                .toList();
    }

    // =========================================
    // 📅 GET APPOINTMENTS
    // =========================================
    public List<Appointment> getAllAppointments() {
        return appointmentsRepository.findAll();
    }

    // =========================================
    // ❌ CANCEL APPOINTMENT (Secured)
    // =========================================
    public String cancelAppointment(String appointmentId) {

        Appointment appointment = appointmentsRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.isCancelled()) {
            throw new BadRequestException("Appointment is already cancelled");
        }

        appointment.setCancelled(true);
        appointmentsRepository.save(appointment);

        // Use MongoTemplate $pull to safely release the slot
        Query query = new Query(Criteria.where("_id").is(appointment.getDoctorId()));
        String dynamicField = "slots_booked." + appointment.getSlotDate();
        Update update = new Update().pull(dynamicField, appointment.getSlotTime());
        mongoTemplate.updateFirst(query, update, Doctor.class);

        // ✅ SEND PUSH NOTIFICATION TO PATIENT
        userRepository.findById(appointment.getUserId()).ifPresent(patient -> {
            if (patient.getExpoPushToken() != null) {
                String docName = appointment.getDocData() != null ?
                        (String) appointment.getDocData().getOrDefault("name", "the doctor") : "the doctor";

                pushNotificationService.sendPushNotification(
                        patient.getExpoPushToken(),
                        "Appointment Cancelled ❌",
                        "Your appointment with Dr. " + docName + " on " + appointment.getSlotDate() + " has been cancelled by admin.",
                        Map.of("appointmentId", appointmentId, "type", "cancelled")
                );
            }
        });

        return "Appointment Cancelled";
    }

    // =========================================
    // ✅ COMPLETE APPOINTMENT (Moved from Controller)
    // =========================================
    public String completeAppointment(String appointmentId) {
        Appointment appointment = appointmentsRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.isCancelled()) {
            throw new BadRequestException("Cannot complete a cancelled appointment");
        }
        if (appointment.isCompleted()) {
            throw new BadRequestException("Appointment already completed");
        }

        appointment.setCompleted(true);
        appointmentsRepository.save(appointment);

        // ✅ SEND PUSH NOTIFICATION TO PATIENT
        userRepository.findById(appointment.getUserId()).ifPresent(patient -> {
            if (patient.getExpoPushToken() != null) {
                String docName = appointment.getDocData() != null ?
                        (String) appointment.getDocData().getOrDefault("name", "the doctor") : "the doctor";

                pushNotificationService.sendPushNotification(
                        patient.getExpoPushToken(),
                        "Appointment Completed ✅",
                        "Your appointment with Dr. " + docName + " on " + appointment.getSlotDate() + " is marked as completed.",
                        Map.of("appointmentId", appointmentId, "type", "completed")
                );
            }
        });

        return "Appointment completed";
    }

    // =========================================
    // 📊 DASHBOARD
    // =========================================
    public Map<String, Object> getDashboard() {
        List<Appointment> appointments = appointmentsRepository.findAll();

        return Map.of(
                "doctors", doctorRepository.count(),
                "appointments", appointments.size(),
                "patients", userRepository.count(),
                "latestAppointments",
                appointments.stream()
                        .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                        .limit(5)
                        .toList()
        );
    }

    // =========================================
    // 🔧 SYNC DOCTOR SLOTS (Secured Logging)
    // =========================================
    public String syncAllDoctorSlots() {
        List<Doctor> doctors = doctorRepository.findAll();
        int syncCount = 0;

        for (Doctor doc : doctors) {
            List<Appointment> activeAppointments = appointmentsRepository.findByDoctorIdAndCancelledFalse(doc.getId());

            Map<String, List<String>> accurateSlots = new HashMap<>();

            for (Appointment apt : activeAppointments) {
                accurateSlots.computeIfAbsent(apt.getSlotDate(), k -> new ArrayList<>()).add(apt.getSlotTime());
            }

            doc.setSlotsBooked(accurateSlots);
            doctorRepository.save(doc);

            syncCount++;

            logger.info("Synced Dr. {} -> {}", doc.getName(), accurateSlots);
        }

        return "Successfully synced " + syncCount + " doctors.";
    }
}