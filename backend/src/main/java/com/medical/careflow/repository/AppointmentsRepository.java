package com.medical.careflow.repository;

import com.medical.careflow.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AppointmentsRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByUserId(String userId);
    List<Appointment> findByDoctorId(String doctorId);

    // ✅ NEW: Fetch only active (non-cancelled) appointments for a specific doctor
    List<Appointment> findByDoctorIdAndCancelledFalse(String doctorId);
    // ✅ Find all appointments where this user is either the patient or the doctor
    List<Appointment> findByUserIdOrDoctorId(String userId, String doctorId);
}