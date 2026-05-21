package com.medical.careflow.service;

import com.medical.careflow.model.Speciality;
import com.medical.careflow.repository.SpecialityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpecialityService {

    @Autowired
    private SpecialityRepository specialityRepository;

    public List<Speciality> getAll(){
        return specialityRepository.findAll();
    }
}
