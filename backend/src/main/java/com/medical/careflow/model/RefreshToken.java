package com.medical.careflow.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "refresh_tokens")
public class RefreshToken {

    @Id
    private String id;

    @Indexed
    private String userId;

    private List<String> roles;

    @Indexed(expireAfter = "0")
    private Date expiryDate;

    @Indexed(unique = true)
    private String token;

    // ✅ NEW: Groups all rotated tokens from the same login session
    @Indexed
    private String familyId;

    // ✅ NEW: Marks if this token was already used (replay detection)
    private boolean reused;
}