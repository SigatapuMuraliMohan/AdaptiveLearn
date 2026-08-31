package com.personalized.learning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_preferences")
public class LearningPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false, unique = true)
    @JsonIgnore
    private StudentProfile studentProfile;

    @Column(name = "preferred_style", length = 100)
    private String preferredStyle = "hands-on with analogies";

    @Column(name = "weekly_hours", nullable = false)
    private Integer weeklyHours = 5;

    @Enumerated(EnumType.STRING)
    @Column(name = "pace_preference")
    private PacePreference pacePreference = PacePreference.MODERATE;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum PacePreference {
        SLOW, MODERATE, FAST
    }

    public LearningPreference() {}

    public LearningPreference(StudentProfile studentProfile, String preferredStyle, Integer weeklyHours, PacePreference pacePreference) {
        this.studentProfile = studentProfile;
        this.preferredStyle = preferredStyle;
        this.weeklyHours = weeklyHours;
        this.pacePreference = pacePreference;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public String getPreferredStyle() { return preferredStyle; }
    public void setPreferredStyle(String preferredStyle) { this.preferredStyle = preferredStyle; }

    public Integer getWeeklyHours() { return weeklyHours; }
    public void setWeeklyHours(Integer weeklyHours) { this.weeklyHours = weeklyHours; }

    public PacePreference getPacePreference() { return pacePreference; }
    public void setPacePreference(PacePreference pacePreference) { this.pacePreference = pacePreference; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
