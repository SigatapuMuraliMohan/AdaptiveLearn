package com.personalized.learning.controller;

import com.personalized.learning.model.Assessment;
import com.personalized.learning.service.AssessmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping({"/generate-custom/{itemId}", "/generate/{itemId}"})
    public ResponseEntity<Assessment> generateCustomAssessment(
            Authentication authentication,
            @PathVariable Long itemId,
            @RequestBody(required = false) Map<String, Object> options) {
        Map<String, Object> safeOptions = (options != null) ? options : Map.of();
        return ResponseEntity.ok(assessmentService.generateCustomAssessment(itemId, authentication != null ? authentication.getName() : null, safeOptions));
    }

    @GetMapping({"/{assessmentId}", "/item/{assessmentId}"})
    public ResponseEntity<Assessment> getAssessment(@PathVariable Long assessmentId) {
        return ResponseEntity.ok(assessmentService.getAssessment(assessmentId));
    }

    @PostMapping("/{assessmentId}/submit")
    public ResponseEntity<Map<String, Object>> submitAssessment(
            Authentication authentication,
            @PathVariable Long assessmentId,
            @RequestBody Map<String, String> answers) {
        return ResponseEntity.ok(assessmentService.submitAssessment(assessmentId, authentication.getName(), answers));
    }
}
