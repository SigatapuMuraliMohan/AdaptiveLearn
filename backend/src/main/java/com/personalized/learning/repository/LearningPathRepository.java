package com.personalized.learning.repository;

import com.personalized.learning.model.LearningPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningPathRepository extends JpaRepository<LearningPath, Long> {
    List<LearningPath> findByStudentProfileIdOrderByCreatedAtDesc(Long profileId);
    Optional<LearningPath> findFirstByStudentProfileIdAndStatus(Long profileId, LearningPath.PathStatus status);
}
