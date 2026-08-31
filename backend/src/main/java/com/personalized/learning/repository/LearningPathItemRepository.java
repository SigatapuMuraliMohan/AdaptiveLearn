package com.personalized.learning.repository;

import com.personalized.learning.model.LearningPathItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPathItemRepository extends JpaRepository<LearningPathItem, Long> {
    List<LearningPathItem> findByLearningPathIdOrderBySequenceOrderAsc(Long pathId);
}
