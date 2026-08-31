package com.personalized.learning.service;

import com.personalized.learning.ai.AiServiceClient;
import com.personalized.learning.model.*;
import com.personalized.learning.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AiTutorService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final StudentProfileRepository profileRepository;
    private final LearningPathItemRepository itemRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final FeedbackRepository feedbackRepository;
    private final LearningPathService learningPathService;
    private final AiServiceClient aiServiceClient;

    public AiTutorService(ConversationRepository conversationRepository,
                          ChatMessageRepository chatMessageRepository,
                          StudentProfileRepository profileRepository,
                          LearningPathItemRepository itemRepository,
                          StudentSkillRepository studentSkillRepository,
                          FeedbackRepository feedbackRepository,
                          LearningPathService learningPathService,
                          AiServiceClient aiServiceClient) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.profileRepository = profileRepository;
        this.itemRepository = itemRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.feedbackRepository = feedbackRepository;
        this.learningPathService = learningPathService;
        this.aiServiceClient = aiServiceClient;
    }

    @Transactional
    public Map<String, Object> sendMessage(String email, Long itemId, String userMessage) {
        StudentProfile profile = profileRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        LearningPathItem item = (itemId != null) ? itemRepository.findById(itemId).orElse(null) : null;
        String topicName = (item != null) ? item.getTopicName() : "General Programming";

        // Check for Conversational Goal Adaptation / Roadmap Re-tuning
        String msgLower = userMessage.toLowerCase().trim();
        LearningPath adaptedCourse = null;
        if (item != null && item.getLearningPath() != null) {
            if (msgLower.startsWith("adapt goal to ") || msgLower.startsWith("change goal to ") || msgLower.startsWith("pivot to ")) {
                String newGoal = userMessage.replaceFirst("(?i)(adapt goal to|change goal to|pivot to)", "").trim();
                if (!newGoal.isBlank()) {
                    try {
                        adaptedCourse = learningPathService.adaptCourseGoal(item.getLearningPath().getId(), email, Map.of("newGoal", newGoal));
                    } catch (Exception ignored) {}
                }
            } else if (msgLower.startsWith("modify roadmap:") || msgLower.startsWith("retune roadmap:") || msgLower.startsWith("add topic ")) {
                try {
                    adaptedCourse = learningPathService.modifyRoadmapWithAi(item.getLearningPath().getId(), email, Map.of("modificationIntent", userMessage));
                } catch (Exception ignored) {}
            }
        }

        // Find or create conversation for this item
        Conversation conversation = null;
        if (item != null) {
            conversation = conversationRepository.findFirstByStudentProfileIdAndPathItemId(profile.getId(), item.getId())
                    .orElseGet(() -> conversationRepository.save(new Conversation(profile, item, "Tutor Session: " + item.getTitle())));
        } else {
            conversation = conversationRepository.save(new Conversation(profile, null, "General AI Tutor Session"));
        }

        // Save Student Message
        ChatMessage studentMsg = new ChatMessage(conversation, ChatMessage.MessageSender.STUDENT, userMessage);
        chatMessageRepository.save(studentMsg);

        // Fetch recent message history
        List<ChatMessage> historyMsgs = chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<Map<String, String>> historyList = new ArrayList<>();
        for (ChatMessage m : historyMsgs) {
            historyList.add(Map.of(
                    "role", m.getSender() == ChatMessage.MessageSender.STUDENT ? "user" : "assistant",
                    "content", m.getMessageText()
            ));
        }

        // Gather Student Weaknesses & Recent Mistakes Context
        List<String> weakSkills = new ArrayList<>();
        List<StudentSkill> skills = studentSkillRepository.findByStudentProfileId(profile.getId());
        for (StudentSkill sk : skills) {
            if (sk.getStatus() == StudentSkill.SkillStatus.NEEDS_REVISION ||
                    (sk.getMasteryPercentage() != null && sk.getMasteryPercentage().doubleValue() < 70.0)) {
                weakSkills.add(sk.getSkill().getName() + " (" + sk.getMasteryPercentage() + "%)");
            }
        }

        List<String> recentMistakes = new ArrayList<>();
        List<Feedback> recentFeedbacks = feedbackRepository.findByStudentProfileIdOrderByCreatedAtDesc(profile.getId());
        for (Feedback fb : recentFeedbacks.stream().limit(3).toList()) {
            if (fb.getWeaknesses() != null && !fb.getWeaknesses().equals("[]")) {
                recentMistakes.add(fb.getWeaknesses());
            }
        }

        // Call FastAPI AI Service with rich pedagogical context
        Map<String, Object> aiPayload = Map.of(
                "student_id", profile.getId(),
                "topic_name", topicName,
                "current_level", profile.getCurrentLevel().name(),
                "learning_style", "hands-on with analogies and step-by-step breakdown",
                "weak_skills", weakSkills,
                "recent_mistakes", recentMistakes,
                "message", userMessage,
                "conversation_history", historyList
        );

        Map<String, Object> aiResponse = aiServiceClient.chatWithTutor(aiPayload);
        String replyText = (String) aiResponse.getOrDefault("reply", "Let's explore this step-by-step.");

        if (adaptedCourse != null) {
            replyText = "### 🔄 Curriculum Roadmap Successfully Adapted!\n\n" +
                    "I have updated your forward curriculum for **" + adaptedCourse.getGoalText() + "** while preserving your completed milestone progress.\n\n" +
                    replyText;
        }

        // Save AI Response
        ChatMessage aiMsg = new ChatMessage(conversation, ChatMessage.MessageSender.AI, replyText);
        chatMessageRepository.save(aiMsg);

        Map<String, Object> result = new HashMap<>();
        result.put("conversationId", conversation.getId());
        result.put("reply", replyText);
        result.put("suggestedFollowups", aiResponse.get("suggested_followups"));
        if (adaptedCourse != null) {
            result.put("adaptedCourse", adaptedCourse);
        }

        return result;
    }

    public List<ChatMessage> getConversationHistory(Long conversationId) {
        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }
}
