package com.personalized.learning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_predictions")
public class RiskPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private StudentProfile studentProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel = RiskLevel.LOW;

    @Column(name = "risk_score", precision = 5, scale = 4, nullable = false)
    private BigDecimal riskScore = BigDecimal.ZERO;

    @Column(name = "feature_values", columnDefinition = "JSON")
    private String featureValues;

    @Column(name = "generated_reason", columnDefinition = "TEXT")
    private String generatedReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum RiskLevel {
        LOW, MEDIUM, HIGH
    }

    public RiskPrediction() {}

    public RiskPrediction(StudentProfile studentProfile, RiskLevel riskLevel, BigDecimal riskScore, String generatedReason) {
        this.studentProfile = studentProfile;
        this.riskLevel = riskLevel;
        this.riskScore = riskScore;
        this.generatedReason = generatedReason;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; }

    public BigDecimal getRiskScore() { return riskScore; }
    public void setRiskScore(BigDecimal riskScore) { this.riskScore = riskScore; }

    public String getFeatureValues() { return featureValues; }
    public void setFeatureValues(String featureValues) { this.featureValues = featureValues; }

    public String getGeneratedReason() { return generatedReason; }
    public void setGeneratedReason(String generatedReason) { this.generatedReason = generatedReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
