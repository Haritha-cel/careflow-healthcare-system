package com.medical.careflow.service;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.JwkProviderBuilder;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.medical.careflow.exception.BadRequestException;
import com.medical.careflow.model.User;
import com.medical.careflow.model.Doctor;
import com.medical.careflow.repository.UserDetailRepository;
import com.medical.careflow.repository.DoctorRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UserDetailRepository userDetailRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${google.client.ids}")
    private String googleClientIdsString;

    @Value("${clerk.issuer}")
    private String clerkIssuer;

    @Value("${clerk.secret-key}")
    private String clerkSecretKey;

    // ✅ These ARE used by handleGoogleLogin() below!
    private static final NetHttpTransport TRANSPORT = new NetHttpTransport();
    private static final JacksonFactory JSON_FACTORY = new JacksonFactory();

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Admin Check
        if (username.equals(adminEmail)) {
            return new org.springframework.security.core.userdetails.User(
                    adminEmail, "", List.of(new SimpleGrantedAuthority("ADMIN"))
            );
        }

        // 2. Check 'users' collection (Patients)
        Optional<User> userOpt = userDetailRepository.findByEmail(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    "",
                    getAuthorities(user)
            );
        }

        // 3. Check 'doctors' collection
        Optional<Doctor> docOpt = doctorRepository.findByEmail(username);
        if (docOpt.isPresent()) {
            Doctor doctor = docOpt.get();
            return new org.springframework.security.core.userdetails.User(
                    doctor.getEmail(),
                    "",
                    List.of(new SimpleGrantedAuthority("DOCTOR"))
            );
        }

        throw new UsernameNotFoundException("User not found with email: " + username);
    }

    private List<SimpleGrantedAuthority> getAuthorities(User user) {
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .toList();
    }

    // =========================================
    // ✅ 1. SECURED GOOGLE LOGIN (VERIFIES TOKEN WITH GOOGLE)
    // =========================================
    public Map<String, Object> handleGoogleLogin(String idTokenString) {

        // 1. Verify the token with Google Servers
        List<String> clientIds = List.of(googleClientIdsString.split(","));

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(TRANSPORT, JSON_FACTORY)
                .setAudience(clientIds)
                .build();

        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(idTokenString);
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify Google Token");
        }

        if (idToken == null) {
            throw new BadRequestException("Invalid or Expired Google Token");
        }

        // 2. Extract VERIFIED user details from the token payload
        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        // 3. Find or Create User
        Optional<User> userOpt = userDetailRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            Map<String, Object> result = new HashMap<>();
            result.put("id", user.getId());
            result.put("name", user.getName() != null ? user.getName() : "");
            result.put("email", user.getEmail());
            result.put("image", user.getImage() != null ? user.getImage() : "");
            result.put("imagePublicId", user.getImagePublicId() != null ? user.getImagePublicId() : "");
            result.put("phone", user.getPhone() != null ? user.getPhone() : "");
            result.put("gender", user.getGender() != null ? user.getGender() : "");
            result.put("dob", user.getDob() != null ? user.getDob() : "");
            result.put("address", user.getAddress() != null ? user.getAddress() : Map.of());
            result.put("role", "patient");
            return result;
        }

        // Create new patient using VERIFIED details
        User newUser = User.builder()
                .name(name)
                .email(email)
                .image(picture)
                .roles(List.of(User.UserRole.PATIENT))
                .active(true)
                .build();
        userDetailRepository.save(newUser);

        Map<String, Object> result = new HashMap<>();
        result.put("id", newUser.getId());
        result.put("name", newUser.getName());
        result.put("email", newUser.getEmail());
        result.put("image", newUser.getImage());
        result.put("imagePublicId", "");
        result.put("phone", "");
        result.put("gender", "");
        result.put("dob", "");
        result.put("address", Map.of());
        result.put("role", "patient");
        return result;
    }

    // =========================================
    // ✅ 2. DOCTOR LOGIN (Email/Password)
    // =========================================
    public Map<String, Object> handleDoctorLogin(String email, String password) {
        Optional<Doctor> docOpt = doctorRepository.findByEmail(email);

        if (docOpt.isEmpty()) {
            throw new BadRequestException("Invalid email or password");
        }

        Doctor doctor = docOpt.get();

        if (!passwordEncoder.matches(password, doctor.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("role", "doctor");
        result.put("name", doctor.getName() != null ? doctor.getName() : "");
        result.put("email", doctor.getEmail());
        result.put("image", doctor.getImage() != null ? doctor.getImage() : "");
        result.put("id", doctor.getId());
        result.put("speciality", doctor.getSpeciality() != null ? doctor.getSpeciality() : "");

        return result;
    }

    // =========================================
    // ✅ 3. CLERK LOGIN (Verifies Clerk Token & Finds/Create User)
    // =========================================
    public Map<String, Object> handleClerkLogin(String clerkToken) {
        try {
            // Steps 1-3 stay exactly the same (JWKS verification)
            String jwksUrl = clerkIssuer + "/.well-known/jwks.json";
            JwkProvider provider = new JwkProviderBuilder(new URL(jwksUrl))
                    .cached(10, 24, TimeUnit.HOURS)
                    .build();

            DecodedJWT unverifiedJwt = JWT.decode(clerkToken);
            Jwk jwk = provider.get(unverifiedJwt.getKeyId());

            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
            DecodedJWT verifiedJwt = JWT.require(algorithm)
                    .withIssuer(clerkIssuer)
                    .build()
                    .verify(clerkToken);

            // ✅ Step 4: Get the Clerk User ID from 'sub' claim
            String clerkUserId = verifiedJwt.getSubject(); // e.g. "user_2abc123..."

            if (clerkUserId == null) {
                throw new BadRequestException("No subject in Clerk token");
            }

            // ✅ Step 5: Fetch real user details from Clerk API using the secret key
            String email = null;
            String name = null;
            String picture = null;

            try {
                URL clerkUserUrl = new URL("https://api.clerk.com/v1/users/" + clerkUserId);
                var connection = (java.net.HttpURLConnection) clerkUserUrl.openConnection();
                connection.setRequestMethod("GET");
                connection.setRequestProperty("Authorization", "Bearer " + clerkSecretKey);
                connection.setRequestProperty("Content-Type", "application/json");

                var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                var userJson = mapper.readTree(connection.getInputStream());

                // Extract primary email
                var emailAddresses = userJson.get("email_addresses");
                if (emailAddresses != null && emailAddresses.isArray() && emailAddresses.size() > 0) {
                    email = emailAddresses.get(0).get("email_address").asText();
                }

                String firstName = userJson.has("first_name") && !userJson.get("first_name").isNull()
                        ? userJson.get("first_name").asText() : "";
                String lastName = userJson.has("last_name") && !userJson.get("last_name").isNull()
                        ? userJson.get("last_name").asText() : "";
                name = (firstName + " " + lastName).trim();

                picture = userJson.has("image_url") && !userJson.get("image_url").isNull()
                        ? userJson.get("image_url").asText() : "";

            } catch (Exception e) {
                throw new BadRequestException("Failed to fetch user from Clerk API: " + e.getMessage());
            }

            if (email == null || email.isEmpty()) {
                throw new BadRequestException("Email not found in Clerk user data");
            }

            return findOrCreatePatient(email, name, picture);

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify Clerk Token: " + e.getMessage());
        }
    }

    // =========================================
    // ✅ HELPER: FIND OR CREATE PATIENT (Used by Clerk & Google)
    // =========================================
    private Map<String, Object> findOrCreatePatient(String email, String name, String picture) {
        Optional<User> userOpt = userDetailRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> result = new HashMap<>();
            result.put("id", user.getId());
            result.put("name", user.getName() != null ? user.getName() : "");
            result.put("email", user.getEmail());
            result.put("image", user.getImage() != null ? user.getImage() : "");
            result.put("imagePublicId", user.getImagePublicId() != null ? user.getImagePublicId() : "");
            result.put("phone", user.getPhone() != null ? user.getPhone() : "");
            result.put("gender", user.getGender() != null ? user.getGender() : "");
            result.put("dob", user.getDob() != null ? user.getDob() : "");
            result.put("address", user.getAddress() != null ? user.getAddress() : Map.of());
            result.put("role", "patient");
            return result;
        }

        // Create new patient
        User newUser = User.builder()
                .name(name)
                .email(email)
                .image(picture)
                .roles(List.of(User.UserRole.PATIENT))
                .active(true)
                .build();
        userDetailRepository.save(newUser);

        Map<String, Object> result = new HashMap<>();
        result.put("id", newUser.getId());
        result.put("name", newUser.getName());
        result.put("email", newUser.getEmail());
        result.put("image", newUser.getImage());
        result.put("imagePublicId", "");
        result.put("phone", "");
        result.put("gender", "");
        result.put("dob", "");
        result.put("address", Map.of());
        result.put("role", "patient");
        return result;
    }
}