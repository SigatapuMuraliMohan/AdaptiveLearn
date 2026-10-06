package com.personalized.learning.service;

import com.personalized.learning.ai.AiServiceClient;
import com.personalized.learning.dto.OnboardingDTO;
import com.personalized.learning.model.*;
import com.personalized.learning.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class StudentProfileService {

    private final StudentProfileRepository profileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillRepository skillRepository;
    private final LearningPathRepository pathRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final AiServiceClient aiServiceClient;
    private final UserRepository userRepository;
    private final LearningPreferenceRepository preferenceRepository;

    public StudentProfileService(StudentProfileRepository profileRepository,
                                 StudentSkillRepository studentSkillRepository,
                                 SkillRepository skillRepository,
                                 LearningPathRepository pathRepository,
                                 AssessmentAttemptRepository attemptRepository,
                                 AiServiceClient aiServiceClient,
                                 UserRepository userRepository,
                                 LearningPreferenceRepository preferenceRepository) {
        this.profileRepository = profileRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.skillRepository = skillRepository;
        this.pathRepository = pathRepository;
        this.attemptRepository = attemptRepository;
        this.aiServiceClient = aiServiceClient;
        this.userRepository = userRepository;
        this.preferenceRepository = preferenceRepository;
    }

    public StudentProfile getProfileByEmail(String email) {
        return profileRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new IllegalArgumentException("User not found for email: " + email));
                    StudentProfile newProfile = new StudentProfile(user);
                    return profileRepository.save(newProfile);
                });
    }

    @Transactional
    public Map<String, Object> saveOnboardingAndGetDiagnostic(String email, OnboardingDTO.OnboardingRequest request) {
        StudentProfile profile = getProfileByEmail(email);

        String safeGoal = (request.getGoal() != null && !request.getGoal().isBlank()) ? request.getGoal().trim() : "Java Backend Developer";
        profile.setCurrentGoal(safeGoal);
        if (request.getStatedLevel() != null) {
            try {
                profile.setCurrentLevel(StudentProfile.KnowledgeLevel.valueOf(request.getStatedLevel().toUpperCase()));
            } catch (Exception ignored) {}
        }
        profile.setTargetOutcome(request.getTargetOutcome() != null ? request.getTargetOutcome() : "Master skills for " + safeGoal);

        LearningPreference pref = preferenceRepository.findByStudentProfileId(profile.getId())
                .orElseGet(() -> {
                    LearningPreference p = new LearningPreference();
                    p.setStudentProfile(profile);
                    return p;
                });

        pref.setPreferredStyle(request.getPreferredStyle() != null ? request.getPreferredStyle() : "hands-on with analogies");
        pref.setWeeklyHours(request.getWeeklyHours() != null ? request.getWeeklyHours() : 8);

        if (request.getPacePreference() != null) {
            String paceStr = request.getPacePreference().toUpperCase();
            if ("RELAXED".equals(paceStr)) {
                pref.setPacePreference(LearningPreference.PacePreference.SLOW);
            } else if ("INTENSIVE".equals(paceStr)) {
                pref.setPacePreference(LearningPreference.PacePreference.FAST);
            } else {
                try {
                    pref.setPacePreference(LearningPreference.PacePreference.valueOf(paceStr));
                } catch (Exception ignored) {
                    pref.setPacePreference(LearningPreference.PacePreference.MODERATE);
                }
            }
        }

        preferenceRepository.save(pref);
        profile.setLearningPreference(pref);
        profileRepository.save(profile);

        // Fetch Diagnostic Assessment from AI Service
        Map<String, Object> diagnosticQuiz = null;
        try {
            diagnosticQuiz = aiServiceClient.generateDiagnosticAssessment(
                    safeGoal,
                    profile.getCurrentLevel().name(),
                    pref.getWeeklyHours()
            );
        } catch (Exception e) {
            throw new RuntimeException("AI service failed to generate baseline diagnostic: " + e.getMessage(), e);
        }

        if (diagnosticQuiz == null || diagnosticQuiz.isEmpty() || !diagnosticQuiz.containsKey("questions")) {
            throw new RuntimeException("AI service returned an empty or invalid diagnostic assessment response. Please try again.");
        }

        return diagnosticQuiz;
    }

    public Map<String, Object> getStudentDashboardData(String email) {
        StudentProfile profile = getProfileByEmail(email);
        List<StudentSkill> skills = studentSkillRepository.findByStudentProfileId(profile.getId());

        List<Map<String, Object>> skillMasteryList = new ArrayList<>();
        for (StudentSkill ss : skills) {
            Map<String, Object> sMap = new HashMap<>();
            sMap.put("skillName", ss.getSkill().getName());
            sMap.put("category", ss.getSkill().getCategory());
            sMap.put("masteryPercentage", ss.getMasteryPercentage());
            sMap.put("status", ss.getStatus().name());
            skillMasteryList.add(sMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("profileId", profile.getId());
        response.put("email", profile.getUser().getEmail());
        response.put("fullName", profile.getUser().getFullName());
        response.put("goal", profile.getCurrentGoal());
        response.put("level", profile.getCurrentLevel().name());
        response.put("onboardingCompleted", profile.getOnboardingCompleted());
        response.put("skills", skillMasteryList);

        return response;
    }

    public Map<String, Object> predictStudentRisk(String email) {
        StudentProfile profile = getProfileByEmail(email);
        List<LearningPath> paths = pathRepository.findByStudentProfileIdOrderByCreatedAtDesc(profile.getId());

        int totalMilestones = 0;
        int completedMilestones = 0;
        for (LearningPath lp : paths) {
            totalMilestones += (lp.getTotalMilestones() != null ? lp.getTotalMilestones() : 0);
            completedMilestones += (lp.getCompletedMilestones() != null ? lp.getCompletedMilestones() : 0);
        }
        double completionRate = (totalMilestones > 0) ? ((double) completedMilestones / totalMilestones) : 0.5;

        List<AssessmentAttempt> attempts = attemptRepository.findByStudentProfileIdOrderByStartedAtDesc(profile.getId());
        double avgScore = 80.0;
        int failedAttempts = 0;
        if (!attempts.isEmpty()) {
            double sum = 0;
            for (AssessmentAttempt att : attempts) {
                double p = att.getPercentage() != null ? att.getPercentage().doubleValue() : 75.0;
                sum += p;
                if (p < 70.0) failedAttempts++;
            }
            avgScore = sum / attempts.size();
        }

        long daysInactive = 1;
        if (profile.getUpdatedAt() != null) {
            daysInactive = Math.max(0, java.time.temporal.ChronoUnit.DAYS.between(profile.getUpdatedAt(), LocalDateTime.now()));
        }

        Map<String, Object> mlPayload = Map.of(
                "student_id", profile.getId(),
                "completion_rate", completionRate,
                "average_assessment_score", avgScore,
                "score_trend_slope", (avgScore >= 75 ? 0.1 : -0.15),
                "days_since_last_active", (int) daysInactive,
                "missed_assessments_count", failedAttempts
        );

        return aiServiceClient.predictRisk(mlPayload);
    }
}
