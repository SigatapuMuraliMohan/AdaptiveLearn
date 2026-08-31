package com.personalized.learning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "current_goal")
    private String currentGoal;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_level")
    private KnowledgeLevel currentLevel = KnowledgeLevel.BEGINNER;

    @Column(name = "target_outcome", columnDefinition = "TEXT")
    private String targetOutcome;

    @Column(name = "onboarding_completed", nullable = false)
    private Boolean onboardingCompleted = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToOne(mappedBy = "studentProfile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private LearningPreference learningPreference;

    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentSkill> studentSkills = new ArrayList<>();

    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LearningPath> learningPaths = new ArrayList<>();

    public enum KnowledgeLevel {
        BEGINNER, INTERMEDIATE, ADVANCED
    }

    public StudentProfile() {}

    public StudentProfile(User user) {
        this.user = user;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCurrentGoal() { return currentGoal; }
    public void setCurrentGoal(String currentGoal) { this.currentGoal = currentGoal; }

    public KnowledgeLevel getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(KnowledgeLevel currentLevel) { this.currentLevel = currentLevel; }

    public String getTargetOutcome() { return targetOutcome; }
    public void setTargetOutcome(String targetOutcome) { this.targetOutcome = targetOutcome; }

    public Boolean getOnboardingCompleted() { return onboardingCompleted; }
    public void setOnboardingCompleted(Boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public LearningPreference getLearningPreference() { return learningPreference; }
    public void setLearningPreference(LearningPreference learningPreference) { this.learningPreference = learningPreference; }

    public List<StudentSkill> getStudentSkills() { return studentSkills; }
    public void setStudentSkills(List<StudentSkill> studentSkills) { this.studentSkills = studentSkills; }

    public List<LearningPath> getLearningPaths() { return learningPaths; }
    public void setLearningPaths(List<LearningPath> learningPaths) { this.learningPaths = learningPaths; }
}
