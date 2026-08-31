package com.personalized.learning.repository;

import com.personalized.learning.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByStudentProfileIdOrderByUpdatedAtDesc(Long profileId);
    Optional<Conversation> findFirstByStudentProfileIdAndPathItemId(Long profileId, Long pathItemId);
}
