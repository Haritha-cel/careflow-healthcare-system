package com.medical.careflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CareflowApplication {
	public static void main(String[] args) {
		SpringApplication.run(CareflowApplication.class, args);
		System.out.println("Server Started");
	}
}