package com.personalized.learning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false, unique = true)
    @JsonIgnore
    private AssessmentAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private StudentProfile studentProfile;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String summary;

    @Column(columnDefinition = "JSON")
    private String strengths;

    @Column(columnDefinition = "JSON")
    private String weaknesses;

    @Column(name = "actionable_recommendations", columnDefinition = "JSON")
    private String actionableRecommendations;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Feedback() {}

    public Feedback(AssessmentAttempt attempt, StudentProfile studentProfile, String summary,
                    String strengths, String weaknesses, String actionableRecommendations) {
        this.attempt = attempt;
        this.studentProfile = studentProfile;
        this.summary = summary;
        this.strengths = strengths;
        this.weaknesses = weaknesses;
        this.actionableRecommendations = actionableRecommendations;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AssessmentAttempt getAttempt() { return attempt; }
    public void setAttempt(AssessmentAttempt attempt) { this.attempt = attempt; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getStrengths() { return strengths; }
    public void setStrengths(String strengths) { this.strengths = strengths; }

    public String getWeaknesses() { return weaknesses; }
    public void setWeaknesses(String weaknesses) { this.weaknesses = weaknesses; }

    public String getActionableRecommendations() { return actionableRecommendations; }
    public void setActionableRecommendations(String actionableRecommendations) { this.actionableRecommendations = actionableRecommendations; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
