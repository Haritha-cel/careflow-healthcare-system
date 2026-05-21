package com.medical.careflow.repository;

import com.medical.careflow.model.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findAllByUserId(String userId);        // ✅ NEW: for DoS check
    void deleteByUserId(String userId);
    void deleteByToken(String token);
    void deleteByFamilyId(String familyId);                  // ✅ NEW: for theft detection
    long countByUserId(String userId);                        // ✅ NEW: for DoS check
}