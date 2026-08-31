package com.personalized.learning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_skills", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"profile_id", "skill_id"})
})
public class StudentSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private StudentProfile studentProfile;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "mastery_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal masteryPercentage = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillStatus status = SkillStatus.NOT_STARTED;

    @Column(name = "last_assessed_at")
    private LocalDateTime lastAssessedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum SkillStatus {
        NOT_STARTED, IN_PROGRESS, MASTERED, NEEDS_REVISION
    }

    public StudentSkill() {}

    public StudentSkill(StudentProfile studentProfile, Skill skill, BigDecimal masteryPercentage, SkillStatus status) {
        this.studentProfile = studentProfile;
        this.skill = skill;
        this.masteryPercentage = masteryPercentage;
        this.status = status;
        this.lastAssessedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudentProfile getStudentProfile() { return studentProfile; }
    public void setStudentProfile(StudentProfile studentProfile) { this.studentProfile = studentProfile; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public BigDecimal getMasteryPercentage() { return masteryPercentage; }
    public void setMasteryPercentage(BigDecimal masteryPercentage) { this.masteryPercentage = masteryPercentage; }

    public SkillStatus getStatus() { return status; }
    public void setStatus(SkillStatus status) { this.status = status; }

    public LocalDateTime getLastAssessedAt() { return lastAssessedAt; }
    public void setLastAssessedAt(LocalDateTime lastAssessedAt) { this.lastAssessedAt = lastAssessedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
