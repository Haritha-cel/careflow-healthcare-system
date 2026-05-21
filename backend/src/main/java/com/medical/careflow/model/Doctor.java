package com.medical.careflow.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "doctors")
public class Doctor {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email; // Used for Doctor Login

    private String name;
    private String password; // Encrypted Password (Bcrypt)
    private String image;
    private String speciality;
    private String degree;
    private String experience;
    private String about;
    private boolean available;
    private Double fees;

    private Map<String, Object> address;

    // ✅ @Field tells MongoDB to save it as "slots_booked" in the database
    // ✅ @JsonProperty tells React Native to receive it as "slots_booked" in the JSON
    @Field("slots_booked")
    @JsonProperty("slots_booked")
    private Map<String, List<String>> slotsBooked = new HashMap<>();
}