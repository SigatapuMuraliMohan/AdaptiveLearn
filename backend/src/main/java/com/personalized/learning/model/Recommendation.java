package com.personalized.learning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private StudentProfile studentProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation_type", nullable = false)
    private RecommendationType recommendationType = RecommendationType.NEXT_LESSON;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_item_id")
    private LearningPathItem targetItem;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum RecommendationType {
        NEXT_LESSON, REVISION, PRACTICE_QUIZ, REMEDIAL_MODULE
    }

    public Recommendation() {}

    public Recommendation(StudentProfile studentProfile, RecommendationType recommendationType, String title, String reason) {
        this.studentProfile = studentProfile;
        this.recommendationType = recommendationType;
        this.title = title;
        this.reason = reason;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public RecommendationType getRecommendationType() { return recommendationType; }
    public void setRecommendationType(RecommendationType recommendationType) { this.recommendationType = recommendationType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LearningPathItem getTargetItem() { return targetItem; }
    public void setTargetItem(LearningPathItem targetItem) { this.targetItem = targetItem; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
