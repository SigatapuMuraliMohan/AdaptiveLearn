package com.personalized.learning.controller;

import com.personalized.learning.model.Recommendation;
import com.personalized.learning.model.StudentProfile;
import com.personalized.learning.repository.RecommendationRepository;
import com.personalized.learning.repository.StudentProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationRepository recommendationRepository;
    private final StudentProfileRepository profileRepository;

    public RecommendationController(RecommendationRepository recommendationRepository,
                                    StudentProfileRepository profileRepository) {
        this.recommendationRepository = recommendationRepository;
        this.profileRepository = profileRepository;
    }

    @GetMapping
    public ResponseEntity<List<Recommendation>> getRecommendations(Authentication authentication) {
        StudentProfile profile = profileRepository.findByUserEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        return ResponseEntity.ok(recommendationRepository.findByStudentProfileIdOrderByCreatedAtDesc(profile.getId()));
    }
}
