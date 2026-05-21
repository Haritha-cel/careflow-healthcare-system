package com.medical.careflow.service;

import com.medical.careflow.dto.AppointmentRequest;
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
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {

    private final UserDetailRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentsRepository appointmentsRepository;
    private final MongoTemplate mongoTemplate;

    public UserService(UserDetailRepository userRepository,
                       DoctorRepository doctorRepository,
                       AppointmentsRepository appointmentsRepository,
                       MongoTemplate mongoTemplate) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentsRepository = appointmentsRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // =========================================
    // 🔥 BOOK APPOINTMENT (Secured & Atomic)
    // =========================================
    public String bookAppointment(String userId, AppointmentRequest req) {

        // ✅ FIX 1: Throw exceptions instead of returning error strings
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!doctor.isAvailable()) {
            throw new BadRequestException("Doctor is not available for booking");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // ✅ FIX 2: ATOMIC CHECK-AND-BOOK (Prevents Double Booking Race Condition)
        // We do this BEFORE saving the appointment to prevent orphan appointments.
        Query atomicQuery = new Query(Criteria.where("_id").is(req.getDoctorId())
                .and("slots_booked." + req.getSlotDate()).ne(req.getSlotTime()));

        String dynamicField = "slots_booked." + req.getSlotDate();
        Update atomicUpdate = new Update().addToSet(dynamicField, req.getSlotTime());

        Doctor originalDoctor = mongoTemplate.findAndModify(
                atomicQuery,
                atomicUpdate,
                org.springframework.data.mongodb.core.FindAndModifyOptions.options().returnNew(false),
                Doctor.class
        );

        if (originalDoctor == null) {
            throw new ResourceNotFoundException("Doctor not found");
        }

        // Check if the slot was ALREADY booked in the original document
        Map<String, List<String>> originalSlots = originalDoctor.getSlotsBooked();
        if (originalSlots != null
                && originalSlots.containsKey(req.getSlotDate())
                && originalSlots.get(req.getSlotDate()).contains(req.getSlotTime())) {
            throw new BadRequestException("Sorry, this slot was just booked by someone else.");
        }

        // ✅ If we reach here, the slot was successfully claimed! Now create the appointment.
        Appointment appointment = new Appointment();
        appointment.setUserId(user.getId());
        appointment.setDoctorId(req.getDoctorId());

        appointment.setUserData(Map.of(
                "name", user.getName() != null ? user.getName() : "",
                "email", user.getEmail() != null ? user.getEmail() : ""
        ));

        appointment.setDocData(Map.of(
                "name", doctor.getName() != null ? doctor.getName() : "",
                "speciality", doctor.getSpeciality() != null ? doctor.getSpeciality() : "",
                "image", doctor.getImage() != null ? doctor.getImage() : ""
        ));

        appointment.setAmount(doctor.getFees());
        appointment.setSlotDate(req.getSlotDate());
        appointment.setSlotTime(req.getSlotTime());
        appointment.setDate(System.currentTimeMillis());
        appointment.setReminderMinutes(req.getReminderMinutes());

        appointmentsRepository.save(appointment);

        return "Appointment Booked";
    }
}