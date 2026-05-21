package com.medical.careflow.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "users")
public class User implements UserDetails {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password; // Nullable for Google Login
    private String phone;
    private String image;
    private String imagePublicId;
    private String dob;
    private String gender;
    private Map<String, Object> address;
    private boolean active;
    private String expoPushToken;

    @Builder.Default
    private List<UserRole> roles = List.of(UserRole.PATIENT);

    // UserDetails Implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return getRoles().stream()
                // ✅ FIX : REMOVED "ROLE_" prefix.
                // WebSecurityConfig expects exactly "PATIENT", not "ROLE_PATIENT"
                .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(role.name()))
                .toList();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return active; }

    public enum UserRole {
        PATIENT,
        DOCTOR,
        ADMIN
    }
}
