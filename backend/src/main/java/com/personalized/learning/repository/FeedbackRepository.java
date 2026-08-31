package com.personalized.learning.repository;

import com.personalized.learning.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByAttemptId(Long attemptId);
    List<Feedback> findByStudentProfileIdOrderByCreatedAtDesc(Long profileId);
}
