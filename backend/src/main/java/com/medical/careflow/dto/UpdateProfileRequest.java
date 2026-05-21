package com.medical.careflow.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String address;
    private String dob;
    private String gender;
}
