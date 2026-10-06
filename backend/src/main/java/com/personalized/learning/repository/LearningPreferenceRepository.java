package com.personalized.learning.repository;

import com.personalized.learning.model.LearningPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LearningPreferenceRepository extends JpaRepository<LearningPreference, Long> {
    Optional<LearningPreference> findByStudentProfileId(Long profileId);
}
