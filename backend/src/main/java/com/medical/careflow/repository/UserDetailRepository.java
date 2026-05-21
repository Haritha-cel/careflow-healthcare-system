package com.medical.careflow.repository;

import com.medical.careflow.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UserDetailRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}

