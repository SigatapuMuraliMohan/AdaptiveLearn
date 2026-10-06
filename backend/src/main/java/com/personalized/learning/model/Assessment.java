package com.personalized.learning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assessments")
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "path_item_id")
    @JsonIgnore
    private LearningPathItem pathItem;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "assessment_type", nullable = false)
    private AssessmentType assessmentType = AssessmentType.TOPIC_QUIZ;

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints = 10;

    @Column(name = "passing_percentage", precision = 5, scale = 2, nullable = false)
    private BigDecimal passingPercentage = new BigDecimal("70.00");

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sequenceOrder ASC")
    private List<Question> questions = new ArrayList<>();

    public enum AssessmentType {
        DIAGNOSTIC, TOPIC_QUIZ, MILESTONE_TEST
    }

    public Assessment() {}

    public Assessment(String title, AssessmentType assessmentType, Integer totalPoints) {
        this.title = title;
        this.assessmentType = assessmentType;
        this.totalPoints = totalPoints;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LearningPathItem getPathItem() { return pathItem; }
    public void setPathItem(LearningPathItem pathItem) { this.pathItem = pathItem; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public AssessmentType getAssessmentType() { return assessmentType; }
    public void setAssessmentType(AssessmentType assessmentType) { this.assessmentType = assessmentType; }

    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }

    public BigDecimal getPassingPercentage() { return passingPercentage; }
    public void setPassingPercentage(BigDecimal passingPercentage) { this.passingPercentage = passingPercentage; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
}
