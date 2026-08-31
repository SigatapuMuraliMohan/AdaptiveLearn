package com.personalized.learning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_answers")
public class StudentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    @JsonIgnore
    private AssessmentAttempt attempt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "submitted_answer", columnDefinition = "LONGTEXT")
    private String submittedAnswer;

    @Column(name = "score_awarded", precision = 5, scale = 2)
    private BigDecimal scoreAwarded = BigDecimal.ZERO;

    @Column(name = "is_correct")
    private Boolean isCorrect = false;

    @Column(name = "evaluation_details", columnDefinition = "JSON")
    private String evaluationDetails;

    @Column(name = "feedback_text", columnDefinition = "TEXT")
    private String feedbackText;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public StudentAnswer() {}

    public StudentAnswer(AssessmentAttempt attempt, Question question, String submittedAnswer) {
        this.attempt = attempt;
        this.question = question;
        this.submittedAnswer = submittedAnswer;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AssessmentAttempt getAttempt() { return attempt; }
    public void setAttempt(AssessmentAttempt attempt) { this.attempt = attempt; }

    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }

    public String getSubmittedAnswer() { return submittedAnswer; }
    public void setSubmittedAnswer(String submittedAnswer) { this.submittedAnswer = submittedAnswer; }

    public BigDecimal getScoreAwarded() { return scoreAwarded; }
    public void setScoreAwarded(BigDecimal scoreAwarded) { this.scoreAwarded = scoreAwarded; }

    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }

    public String getEvaluationDetails() { return evaluationDetails; }
    public void setEvaluationDetails(String evaluationDetails) { this.evaluationDetails = evaluationDetails; }

    public String getFeedbackText() { return feedbackText; }
    public void setFeedbackText(String feedbackText) { this.feedbackText = feedbackText; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
