package com.medical.careflow.service;

import com.medical.careflow.exception.BadRequestException;
import com.medical.careflow.exception.ResourceNotFoundException;
import com.medical.careflow.model.Appointment;
import com.medical.careflow.model.Doctor;
import com.medical.careflow.model.User;
import com.medical.careflow.repository.AppointmentsRepository;
import com.medical.careflow.repository.DoctorRepository;
import com.medical.careflow.repository.UserDetailRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentsRepository appointmentsRepository;
    private final UserDetailRepository userDetailRepository;
    private final MongoTemplate mongoTemplate;
    private final PushNotificationService pushNotificationService;

    public DoctorService(DoctorRepository doctorRepository,
                         AppointmentsRepository appointmentsRepository,
                         UserDetailRepository userDetailRepository,
                         MongoTemplate mongoTemplate,
                         PushNotificationService pushNotificationService) {
        this.doctorRepository = doctorRepository;
        this.appointmentsRepository = appointmentsRepository;
        this.userDetailRepository = userDetailRepository;
        this.mongoTemplate = mongoTemplate;
        this.pushNotificationService = pushNotificationService;
    }

    // =========================================
    // 🔁 CHANGE AVAILABILITY
    // =========================================
    public String changeAvailability(String doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        doctor.setAvailable(!doctor.isAvailable());
        doctorRepository.save(doctor);
        return "Availability Changed";
    }

    // =========================================
    // 📅 GET APPOINTMENTS
    // =========================================
    public List<Appointment> getAppointments(String doctorId) {
        return appointmentsRepository.findByDoctorId(doctorId);
    }

    // =========================================
    // ✅ COMPLETE APPOINTMENT
    // =========================================
    public String completeAppointment(String doctorId, String appointmentId) {
        Appointment appointment = appointmentsRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getDoctorId().equals(doctorId)) {
            throw new AccessDeniedException("You are not authorized to modify this appointment");
        }

        if (appointment.isCancelled()) {
            throw new BadRequestException("Cannot complete a cancelled appointment");
        }
        if (appointment.isCompleted()) {
            throw new BadRequestException("Appointment is already completed");
        }

        appointment.setCompleted(true);
        appointmentsRepository.save(appointment);

        // ✅ SEND PUSH NOTIFICATION TO PATIENT
        userDetailRepository.findById(appointment.getUserId()).ifPresent(patient -> {
            if (patient.getExpoPushToken() != null) {
                String docName = appointment.getDocData() != null ?
                        (String) appointment.getDocData().getOrDefault("name", "the doctor") : "the doctor";

                pushNotificationService.sendPushNotification(
                        patient.getExpoPushToken(),
                        "Appointment Completed ✅",
                        "Your appointment with Dr. " + docName + " on " + appointment.getSlotDate() + " is completed. We hope you're feeling better!",
                        Map.of("appointmentId", appointmentId, "type", "completed")
                );
            }
        });

        return "Appointment Completed";
    }

    // =========================================
    // ❌ CANCEL APPOINTMENT (FIXED: Releases Slot)
    // =========================================
    public String cancelAppointment(String doctorId, String appointmentId) {
        Appointment appointment = appointmentsRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getDoctorId().equals(doctorId)) {
            throw new AccessDeniedException("You are not authorized to modify this appointment");
        }

        if (appointment.isCancelled()) {
            throw new BadRequestException("Appointment is already cancelled");
        }

        appointment.setCancelled(true);
        appointmentsRepository.save(appointment);

        // RELEASE THE SLOT BACK TO THE DOCTOR
        Query query = new Query(Criteria.where("_id").is(doctorId));
        String dynamicField = "slots_booked." + appointment.getSlotDate();
        Update update = new Update().pull(dynamicField, appointment.getSlotTime());
        mongoTemplate.updateFirst(query, update, Doctor.class);

        // ✅ SEND PUSH NOTIFICATION TO PATIENT
        userDetailRepository.findById(appointment.getUserId()).ifPresent(patient -> {
            if (patient.getExpoPushToken() != null) {
                String docName = appointment.getDocData() != null ?
                        (String) appointment.getDocData().getOrDefault("name", "the doctor") : "the doctor";

                pushNotificationService.sendPushNotification(
                        patient.getExpoPushToken(),
                        "Appointment Cancelled ❌",
                        "Your appointment with Dr. " + docName + " on " + appointment.getSlotDate() + " has been cancelled.",
                        Map.of("appointmentId", appointmentId, "type", "cancelled")
                );
            }
        });

        return "Appointment Cancelled";
    }

    // =========================================
    // 📊 DASHBOARD
    // =========================================
    public Map<String, Object> getDashboard(String doctorId) {
        List<Appointment> appointments = appointmentsRepository.findByDoctorId(doctorId);

        double earnings = 0;
        Set<String> patients = new HashSet<>();

        for (Appointment a : appointments) {
            if (!a.isCancelled() && a.isCompleted()) {
                earnings += a.getAmount() != null ? a.getAmount() : 0;
            }
            if (!a.isCancelled()) {
                patients.add(a.getUserId());
            }
        }

        long upcomingAppointments = appointments.stream()
                .filter(a -> !a.isCancelled())
                .filter(a -> !a.isCompleted())
                .count();

        return Map.of(
                "earnings", earnings,
                "appointments", upcomingAppointments,
                "patients", patients.size(),
                "latestAppointments",
                appointments.stream()
                        .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                        .limit(5)
                        .toList()
        );
    }

    // =========================================
    // 👤 PROFILE
    // =========================================
    public Doctor getProfile(String doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        doctor.setPassword(null);
        return doctor;
    }

    // =========================================
    // ✏️ UPDATE PROFILE (FIXED: Saves Address)
    // =========================================
    public String updateProfile(String doctorId, Double fees, Boolean available, Map<String, Object> address) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (fees != null && !Double.isNaN(fees)) {
            if (fees < 0) throw new BadRequestException("Fees cannot be negative");
            doctor.setFees(fees);
        }
        if (available != null) {
            doctor.setAvailable(available);
        }

        if (address != null) {
            doctor.setAddress(address);
        }

        doctorRepository.save(doctor);
        return "Profile Updated";
    }
}