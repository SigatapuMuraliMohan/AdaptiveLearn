package com.personalized.learning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_path_items")
public class LearningPathItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "path_id", nullable = false)
    @JsonIgnore
    private LearningPath learningPath;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "topic_name", nullable = false, length = 150)
    private String topicName;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", nullable = false)
    private DifficultyLevel difficultyLevel = DifficultyLevel.BEGINNER;

    @Column(name = "estimated_minutes", nullable = false)
    private Integer estimatedMinutes = 30;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemStatus status = ItemStatus.LOCKED;

    @Column(name = "is_remedial", nullable = false)
    private Boolean isRemedial = false;

    @Column(name = "lesson_content", columnDefinition = "LONGTEXT")
    private String lessonContent;

    @Column(name = "lesson_content_json", columnDefinition = "LONGTEXT")
    private String lessonContentJson;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum DifficultyLevel {
        BEGINNER, INTERMEDIATE, ADVANCED
    }

    public enum ItemStatus {
        LOCKED, UNLOCKED, IN_PROGRESS, COMPLETED, REMEDIAL
    }

    public LearningPathItem() {}

    public LearningPathItem(LearningPath learningPath, String title, String topicName, String description,
                            Integer sequenceOrder, DifficultyLevel difficultyLevel, Integer estimatedMinutes, ItemStatus status) {
        this.learningPath = learningPath;
        this.title = title;
        this.topicName = topicName;
        this.description = description;
        this.sequenceOrder = sequenceOrder;
        this.difficultyLevel = difficultyLevel;
        this.estimatedMinutes = estimatedMinutes;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LearningPath getLearningPath() { return learningPath; }
    public void setLearningPath(LearningPath learningPath) { this.learningPath = learningPath; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTopicName() { return topicName; }
    public void setTopicName(String topicName) { this.topicName = topicName; }

    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }

    public DifficultyLevel getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(DifficultyLevel difficultyLevel) { this.difficultyLevel = difficultyLevel; }

    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

    public ItemStatus getStatus() { return status; }
    public void setStatus(ItemStatus status) { this.status = status; }

    public Boolean getIsRemedial() { return isRemedial; }
    public void setIsRemedial(Boolean isRemedial) { this.isRemedial = isRemedial; }

    public String getLessonContent() { return lessonContent; }
    public void setLessonContent(String lessonContent) { this.lessonContent = lessonContent; }

    public String getLessonContentJson() { return lessonContentJson; }
    public void setLessonContentJson(String lessonContentJson) { this.lessonContentJson = lessonContentJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
