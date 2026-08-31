package com.personalized.learning.repository;

import com.personalized.learning.model.AssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {
    List<AssessmentAttempt> findByStudentProfileIdOrderByStartedAtDesc(Long profileId);
    List<AssessmentAttempt> findByAssessmentIdAndStudentProfileId(Long assessmentId, Long profileId);
}
