package com.personalized.learning.controller;

import com.personalized.learning.dto.OnboardingDTO;
import com.personalized.learning.service.StudentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentProfileController {

    private final StudentProfileService profileService;

    public StudentProfileController(StudentProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping("/onboarding")
    public ResponseEntity<Map<String, Object>> submitOnboarding(
            Authentication authentication,
            @RequestBody OnboardingDTO.OnboardingRequest request) {
        return ResponseEntity.ok(profileService.saveOnboardingAndGetDiagnostic(authentication.getName(), request));
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        return ResponseEntity.ok(profileService.getStudentDashboardData(authentication.getName()));
    }

    @GetMapping("/risk-prediction")
    public ResponseEntity<Map<String, Object>> getRiskPrediction(Authentication authentication) {
        return ResponseEntity.ok(profileService.predictStudentRisk(authentication.getName()));
    }
}
