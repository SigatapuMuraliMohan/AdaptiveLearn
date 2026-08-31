package com.personalized.learning.repository;

import com.personalized.learning.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByPathItemId(Long pathItemId);
    Optional<Assessment> findFirstByAssessmentType(Assessment.AssessmentType type);
}
