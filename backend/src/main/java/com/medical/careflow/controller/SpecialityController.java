package com.medical.careflow.controller;

import com.medical.careflow.model.Speciality;
import com.medical.careflow.service.SpecialityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/specialities")
public class SpecialityController {

    @Autowired
    private SpecialityService specialityService;

    // ✅ IMPROVED: Wrapped in standard consistent response format
    @GetMapping
    public ResponseEntity<?> getAll(){
        List<Speciality> specialities = specialityService.getAll();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "specialities", specialities
        ));
    }
}