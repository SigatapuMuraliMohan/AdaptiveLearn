package com.personalized.learning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learning_paths")
public class LearningPath {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private StudentProfile studentProfile;

    @Column(name = "goal_text", nullable = false)
    private String goalText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PathStatus status = PathStatus.ACTIVE;

    @Column(name = "total_milestones", nullable = false)
    private Integer totalMilestones = 1;

    @Column(name = "completed_milestones", nullable = false)
    private Integer completedMilestones = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "learningPath", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sequenceOrder ASC")
    private List<LearningPathItem> items = new ArrayList<>();

    public enum PathStatus {
        ACTIVE, COMPLETED, ADAPTED
    }

    public LearningPath() {}

    public LearningPath(StudentProfile studentProfile, String goalText, Integer totalMilestones) {
        this.studentProfile = studentProfile;
        this.goalText = goalText;
        this.totalMilestones = totalMilestones;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public String getGoalText() { return goalText; }
    public void setGoalText(String goalText) { this.goalText = goalText; }

    public PathStatus getStatus() { return status; }
    public void setStatus(PathStatus status) { this.status = status; }

    public Integer getTotalMilestones() { return totalMilestones; }
    public void setTotalMilestones(Integer totalMilestones) { this.totalMilestones = totalMilestones; }

    public Integer getCompletedMilestones() { return completedMilestones; }
    public void setCompletedMilestones(Integer completedMilestones) { this.completedMilestones = completedMilestones; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public List<LearningPathItem> getItems() { return items; }
    public void setItems(List<LearningPathItem> items) { this.items = items; }
}
