package com.medical.careflow.repository;

import com.medical.careflow.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DoctorRepository extends MongoRepository<Doctor, String> {

    Optional<Doctor> findByEmail(String email);
}