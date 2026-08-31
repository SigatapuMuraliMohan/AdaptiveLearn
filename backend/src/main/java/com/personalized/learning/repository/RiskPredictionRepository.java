package com.personalized.learning.repository;

import com.personalized.learning.model.RiskPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RiskPredictionRepository extends JpaRepository<RiskPrediction, Long> {
    List<RiskPrediction> findByStudentProfileIdOrderByCreatedAtDesc(Long profileId);
    Optional<RiskPrediction> findFirstByStudentProfileIdOrderByCreatedAtDesc(Long profileId);
}
