package com.medical.careflow.repository;

import com.medical.careflow.model.Speciality;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpecialityRepository extends MongoRepository<Speciality,String> {
}
