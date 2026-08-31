package com.personalized.learning.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalized.learning.ai.AiServiceClient;
import com.personalized.learning.model.*;
import com.personalized.learning.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class LearningPathService {

    private final LearningPathRepository pathRepository;
    private final LearningPathItemRepository pathItemRepository;
    private final StudentProfileRepository profileRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final ConversationRepository conversationRepository;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public LearningPathService(LearningPathRepository pathRepository,
                               LearningPathItemRepository pathItemRepository,
                               StudentProfileRepository profileRepository,
                               AssessmentRepository assessmentRepository,
                               AssessmentAttemptRepository attemptRepository,
                               ConversationRepository conversationRepository,
                               AiServiceClient aiServiceClient,
                               ObjectMapper objectMapper) {
        this.pathRepository = pathRepository;
        this.pathItemRepository = pathItemRepository;
        this.profileRepository = profileRepository;
        this.assessmentRepository = assessmentRepository;
        this.attemptRepository = attemptRepository;
        this.conversationRepository = conversationRepository;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public LearningPath createCourseRoadmap(String email, Map<String, Object> request) {
        StudentProfile profile = profileRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        String goal = (String) request.getOrDefault("goal", "Full Stack Development");
        String level = (String) request.getOrDefault("experienceLevel", "BEGINNER");
        int weeklyHours = ((Number) request.getOrDefault("weeklyHours", 8)).intValue();
        String learningStyle = (String) request.getOrDefault("learningStyle", "hands-on with analogies");

        Map<String, Object> aiPayload = Map.of(
                "student_id", profile.getId(),
                "goal", goal,
                "experience_level", level,
                "weekly_hours", weeklyHours,
                "learning_style", learningStyle
        );

        Map<String, Object> aiResponse = aiServiceClient.createCourseRoadmap(aiPayload);

        String courseTitle = (String) aiResponse.getOrDefault("course_title", goal);
        List<Map<String, Object>> modules = (List<Map<String, Object>>) aiResponse.get("modules");
        int totalMilestones = modules != null ? modules.size() : 1;

        LearningPath newPath = new LearningPath(profile, courseTitle, totalMilestones);
        newPath.setStatus(LearningPath.PathStatus.ACTIVE);
        newPath = pathRepository.save(newPath);

        if (modules != null) {
            int seq = 1;
            for (Map<String, Object> m : modules) {
                String title = (String) m.get("title");
                String topicName = (String) m.get("topic_name");
                String description = (String) m.get("description");
                String diffStr = (String) m.getOrDefault("difficulty_level", "BEGINNER");
                int estMinutes = ((Number) m.getOrDefault("estimated_minutes", 60)).intValue();

                LearningPathItem.DifficultyLevel diffLevel = LearningPathItem.DifficultyLevel.BEGINNER;
                try {
                    diffLevel = LearningPathItem.DifficultyLevel.valueOf(diffStr.toUpperCase());
                } catch (Exception ignored) {}

                LearningPathItem.ItemStatus itemStatus = (seq == 1) ? LearningPathItem.ItemStatus.UNLOCKED : LearningPathItem.ItemStatus.LOCKED;

                LearningPathItem item = new LearningPathItem(
                        newPath, title, topicName, description, seq, diffLevel, estMinutes, itemStatus
                );
                item.setIsRemedial(false);
                pathItemRepository.save(item);
                seq++;
            }
        }

        profile.setCurrentGoal(courseTitle);
        profile.setOnboardingCompleted(true);
        profileRepository.save(profile);

        return pathRepository.findById(newPath.getId()).orElse(newPath);
    }

    public List<LearningPath> getAllCoursesForStudent(String email) {
        StudentProfile profile = profileRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        return pathRepository.findByStudentProfileIdOrderByCreatedAtDesc(profile.getId());
    }

    public Optional<LearningPath> getCourseById(Long courseId, String email) {
        return pathRepository.findById(courseId);
    }

    public Optional<LearningPath> getActivePath(String email) {
        StudentProfile profile = profileRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        return pathRepository.findFirstByStudentProfileIdAndStatus(profile.getId(), LearningPath.PathStatus.ACTIVE);
    }

    @Transactional
    public Map<String, Object> getOrGenerateLessonContent(Long itemId, String email) {
        LearningPathItem item = pathItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (item.getLessonContentJson() != null && !item.getLessonContentJson().isBlank()) {
            try {
                return objectMapper.readValue(item.getLessonContentJson(), Map.class);
            } catch (Exception ignored) {}
        }

        // Call FastAPI to generate comprehensive, in-depth lecture notes & video resources
        Map<String, Object> aiPayload = Map.of(
                "topic_name", item.getTopicName(),
                "course_goal", item.getLearningPath().getGoalText(),
                "difficulty_level", item.getDifficultyLevel().name(),
                "learning_style", "hands-on with analogies"
        );

        Map<String, Object> contentRes = aiServiceClient.generateLessonContent(aiPayload);

        try {
            item.setLessonContentJson(objectMapper.writeValueAsString(contentRes));
            pathItemRepository.save(item);
        } catch (Exception ignored) {}

        return contentRes;
    }

    @Transactional
    public LearningPathItem completeItemAndUnlockNext(Long itemId, String email) {
        LearningPathItem item = pathItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        item.setStatus(LearningPathItem.ItemStatus.COMPLETED);
        pathItemRepository.save(item);

        // Unlock next sequential module
        LearningPath path = item.getLearningPath();
        List<LearningPathItem> allItems = pathItemRepository.findByLearningPathIdOrderBySequenceOrderAsc(path.getId());

        boolean unlockNext = false;
        int completedCount = 0;
        for (LearningPathItem it : allItems) {
            if (it.getStatus() == LearningPathItem.ItemStatus.COMPLETED) {
                completedCount++;
            }
            if (unlockNext && (it.getStatus() == LearningPathItem.ItemStatus.LOCKED || it.getStatus() == LearningPathItem.ItemStatus.REMEDIAL)) {
                it.setStatus(LearningPathItem.ItemStatus.UNLOCKED);
                pathItemRepository.save(it);
                unlockNext = false;
            }
            if (it.getId().equals(itemId)) {
                unlockNext = true;
            }
        }

        path.setCompletedMilestones(completedCount);
        if (completedCount >= path.getTotalMilestones()) {
            path.setStatus(LearningPath.PathStatus.COMPLETED);
        }
        pathRepository.save(path);

        return item;
    }

    @Transactional
    public LearningPathItem insertRemedialItem(Long pathId, LearningPathItem currentItem, Map<String, Object> remedialData) {
        LearningPath path = pathRepository.findById(pathId)
                .orElseThrow(() -> new IllegalArgumentException("Path not found"));

        String title = (String) remedialData.getOrDefault("title", "Remedial Mastery: " + currentItem.getTopicName());
        String desc = (String) remedialData.getOrDefault("description", "Targeted remedial practice to strengthen core concepts.");
        String topic = (String) remedialData.getOrDefault("topic_name", currentItem.getTopicName() + " Remedial");

        // Shift subsequent items' sequence orders by +1
        List<LearningPathItem> allItems = pathItemRepository.findByLearningPathIdOrderBySequenceOrderAsc(pathId);
        int insertSeq = currentItem.getSequenceOrder() + 1;
        for (LearningPathItem it : allItems) {
            if (it.getSequenceOrder() >= insertSeq && !it.getId().equals(currentItem.getId())) {
                it.setSequenceOrder(it.getSequenceOrder() + 1);
                pathItemRepository.save(it);
            }
        }

        LearningPathItem remedialItem = new LearningPathItem(
                path,
                title,
                topic,
                desc,
                insertSeq,
                LearningPathItem.DifficultyLevel.BEGINNER,
                25,
                LearningPathItem.ItemStatus.UNLOCKED
        );
        remedialItem.setIsRemedial(true);
        LearningPathItem saved = pathItemRepository.save(remedialItem);

        path.setTotalMilestones(path.getTotalMilestones() + 1);
        pathRepository.save(path);

        return saved;
    }

    // -------------------------------------------------------------------------
    // ROADMAP CUSTOMIZATION CRUD & AI RE-TUNING
    // -------------------------------------------------------------------------

    @Transactional
    public LearningPathItem addCustomItem(Long courseId, String email, Map<String, Object> itemData) {
        LearningPath path = pathRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course roadmap not found"));

        String title = (String) itemData.getOrDefault("title", "Custom Module");
        String topicName = (String) itemData.getOrDefault("topicName", title);
        String desc = (String) itemData.getOrDefault("description", "Custom student-defined topic module.");
        int estMinutes = ((Number) itemData.getOrDefault("estimatedMinutes", 45)).intValue();
        String diffStr = (String) itemData.getOrDefault("difficultyLevel", "BEGINNER");

        LearningPathItem.DifficultyLevel diffLevel = LearningPathItem.DifficultyLevel.BEGINNER;
        try {
            diffLevel = LearningPathItem.DifficultyLevel.valueOf(diffStr.toUpperCase());
        } catch (Exception ignored) {}

        List<LearningPathItem> allItems = pathItemRepository.findByLearningPathIdOrderBySequenceOrderAsc(courseId);
        int nextSeq = allItems.isEmpty() ? 1 : (allItems.get(allItems.size() - 1).getSequenceOrder() + 1);

        LearningPathItem.ItemStatus initialStatus = allItems.isEmpty() ?
                LearningPathItem.ItemStatus.UNLOCKED : LearningPathItem.ItemStatus.LOCKED;

        LearningPathItem newItem = new LearningPathItem(
                path, title, topicName, desc, nextSeq, diffLevel, estMinutes, initialStatus
        );
        newItem.setIsRemedial(false);
        LearningPathItem saved = pathItemRepository.save(newItem);

        path.setTotalMilestones(allItems.size() + 1);
        pathRepository.save(path);

        return saved;
    }

    @Transactional
    public LearningPathItem updateItem(Long itemId, String email, Map<String, Object> itemData) {
        LearningPathItem item = pathItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Roadmap item not found"));

        if (itemData.containsKey("title")) {
            item.setTitle((String) itemData.get("title"));
        }
        if (itemData.containsKey("topicName")) {
            item.setTopicName((String) itemData.get("topicName"));
        }
        if (itemData.containsKey("description")) {
            item.setDescription((String) itemData.get("description"));
        }
        if (itemData.containsKey("estimatedMinutes")) {
            item.setEstimatedMinutes(((Number) itemData.get("estimatedMinutes")).intValue());
        }
        if (itemData.containsKey("difficultyLevel")) {
            try {
                item.setDifficultyLevel(LearningPathItem.DifficultyLevel.valueOf(
                        ((String) itemData.get("difficultyLevel")).toUpperCase()
                ));
            } catch (Exception ignored) {}
        }
        // Invalidate previous cached lesson content if title or topic changed
        item.setLessonContentJson(null);

        return pathItemRepository.save(item);
    }

    @Transactional
    public LearningPath deleteItem(Long itemId, String email) {
        LearningPathItem item = pathItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Roadmap item not found"));

        LearningPath path = item.getLearningPath();

        // 1. Cascade cleanup associated assessments and attempts
        List<Assessment> assessments = assessmentRepository.findByPathItemId(itemId);
        for (Assessment a : assessments) {
            List<AssessmentAttempt> attempts = attemptRepository.findByAssessmentIdAndStudentProfileId(a.getId(), path.getStudentProfile().getId());
            attemptRepository.deleteAll(attempts);
            assessmentRepository.delete(a);
        }

        // 2. Cascade cleanup associated chat conversations
        conversationRepository.findFirstByStudentProfileIdAndPathItemId(path.getStudentProfile().getId(), itemId)
                .ifPresent(conversationRepository::delete);

        // 3. Delete item
        pathItemRepository.delete(item);

        // 4. Re-sequence remaining items and recalculate stats
        List<LearningPathItem> remaining = pathItemRepository.findByLearningPathIdOrderBySequenceOrderAsc(path.getId());
        int seq = 1;
        int completedCount = 0;
        for (LearningPathItem it : remaining) {
            it.setSequenceOrder(seq);
            if (seq == 1 && it.getStatus() == LearningPathItem.ItemStatus.LOCKED) {
                it.setStatus(LearningPathItem.ItemStatus.UNLOCKED);
            }
            if (it.getStatus() == LearningPathItem.ItemStatus.COMPLETED) {
                completedCount++;
            }
            pathItemRepository.save(it);
            seq++;
        }

        path.setTotalMilestones(remaining.size());
        path.setCompletedMilestones(completedCount);
        return pathRepository.save(path);
    }

    @Transactional
    public Map<String, Object> deleteCourse(Long courseId, String email) {
        LearningPath path = pathRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course roadmap not found"));

        List<LearningPathItem> items = pathItemRepository.findByLearningPathIdOrderBySequenceOrderAsc(courseId);
        for (LearningPathItem item : items) {
            List<Assessment> assessments = assessmentRepository.findByPathItemId(item.getId());
            for (Assessment a : assessments) {
                List<AssessmentAttempt> attempts = attemptRepository.findByAssessmentIdAndStudentProfileId(a.getId(), path.getStudentProfile().getId());
                attemptRepository.deleteAll(attempts);
                assessmentRepository.delete(a);
            }
            conversationRepository.findFirstByStudentProfileIdAndPathItemId(path.getStudentProfile().getId(), item.getId())
                    .ifPresent(conversationRepository::delete);
        }

        pathItemRepository.deleteAll(items);
        pathRepository.delete(path);

        return Map.of("success", true, "message", "Course roadmap deleted successfully", "courseId", courseId);
    }

    // -------------------------------------------------------------------------
    // CONVERSATIONAL GOAL PIVOT & AI RETUNING
    // -------------------------------------------------------------------------

    @Transactional
    public LearningPath adaptCourseGoal(Long courseId, String email, Map<String, Object> request) {
        LearningPath path = pathRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        String newGoal = (String) request.getOrDefault("newGoal", path.getGoalText());
        String prevGoal = path.getGoalText();

        List<LearningPathItem> currentItems = pathItemRepository.findByLearningPathIdOrderBySequenceOrderAsc(courseId);
        List<String> completedModules = new ArrayList<>();
        List<LearningPathItem> preservedItems = new ArrayList<>();
        List<LearningPathItem> toRemove = new ArrayList<>();

        for (LearningPathItem it : currentItems) {
            if (it.getStatus() == LearningPathItem.ItemStatus.COMPLETED) {
                completedModules.add(it.getTopicName());
                preservedItems.add(it);
            } else {
                toRemove.add(it);
            }
        }

        // Delete uncompleted future items and their artifacts
        for (LearningPathItem uncompleted : toRemove) {
            List<Assessment> assessments = assessmentRepository.findByPathItemId(uncompleted.getId());
            for (Assessment a : assessments) {
                List<AssessmentAttempt> attempts = attemptRepository.findByAssessmentIdAndStudentProfileId(a.getId(), path.getStudentProfile().getId());
                attemptRepository.deleteAll(attempts);
                assessmentRepository.delete(a);
            }
            conversationRepository.findFirstByStudentProfileIdAndPathItemId(path.getStudentProfile().getId(), uncompleted.getId())
                    .ifPresent(conversationRepository::delete);
            pathItemRepository.delete(uncompleted);
        }

        // Call FastAPI AI to adapt the forward curriculum
        Map<String, Object> aiPayload = Map.of(
                "student_id", path.getStudentProfile().getId(),
                "previous_goal", prevGoal,
                "new_goal", newGoal,
                "completed_modules", completedModules,
                "experience_level", path.getStudentProfile().getCurrentLevel().name(),
                "weekly_hours", 8,
                "learning_style", "hands-on with analogies"
        );

        Map<String, Object> aiResponse = aiServiceClient.adaptCourseRoadmap(aiPayload);
        List<Map<String, Object>> newModules = (List<Map<String, Object>>) aiResponse.get("modules");

        int nextSeq = preservedItems.size() + 1;
        if (newModules != null) {
            for (Map<String, Object> m : newModules) {
                String title = (String) m.get("title");
                String topicName = (String) m.get("topic_name");
                String description = (String) m.get("description");
                String diffStr = (String) m.getOrDefault("difficulty_level", "INTERMEDIATE");
                int estMinutes = ((Number) m.getOrDefault("estimated_minutes", 60)).intValue();

                LearningPathItem.DifficultyLevel diffLevel = LearningPathItem.DifficultyLevel.INTERMEDIATE;
                try {
                    diffLevel = LearningPathItem.DifficultyLevel.valueOf(diffStr.toUpperCase());
                } catch (Exception ignored) {}

                LearningPathItem.ItemStatus itemStatus = (nextSeq == preservedItems.size() + 1) ?
                        LearningPathItem.ItemStatus.UNLOCKED : LearningPathItem.ItemStatus.LOCKED;

                LearningPathItem item = new LearningPathItem(
                        path, title, topicName, description, nextSeq, diffLevel, estMinutes, itemStatus
                );
                item.setIsRemedial(false);
                pathItemRepository.save(item);
                nextSeq++;
            }
        }

        path.setGoalText(newGoal);
        path.setStatus(LearningPath.PathStatus.ADAPTED);
        path.setTotalMilestones(preservedItems.size() + (newModules != null ? newModules.size() : 0));
        pathRepository.save(path);

        return pathRepository.findById(path.getId()).orElse(path);
    }

    @Transactional
    public LearningPath modifyRoadmapWithAi(Long courseId, String email, Map<String, Object> request) {
        LearningPath path = pathRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        String modificationIntent = (String) request.getOrDefault("modificationIntent", "Retune and optimize curriculum");
        List<LearningPathItem> currentItems = pathItemRepository.findByLearningPathIdOrderBySequenceOrderAsc(courseId);

        List<Map<String, Object>> existingModulesData = new ArrayList<>();
        List<LearningPathItem> preservedItems = new ArrayList<>();
        List<LearningPathItem> toRemove = new ArrayList<>();

        for (LearningPathItem it : currentItems) {
            existingModulesData.add(Map.of(
                    "title", it.getTitle(),
                    "topic_name", it.getTopicName(),
                    "description", it.getDescription() != null ? it.getDescription() : "",
                    "sequence_order", it.getSequenceOrder(),
                    "difficulty_level", it.getDifficultyLevel().name(),
                    "estimated_minutes", it.getEstimatedMinutes()
            ));

            if (it.getStatus() == LearningPathItem.ItemStatus.COMPLETED) {
                preservedItems.add(it);
            } else {
                toRemove.add(it);
            }
        }

        // Clean up uncompleted items before re-synthesizing
        for (LearningPathItem uncompleted : toRemove) {
            List<Assessment> assessments = assessmentRepository.findByPathItemId(uncompleted.getId());
            for (Assessment a : assessments) {
                List<AssessmentAttempt> attempts = attemptRepository.findByAssessmentIdAndStudentProfileId(a.getId(), path.getStudentProfile().getId());
                attemptRepository.deleteAll(attempts);
                assessmentRepository.delete(a);
            }
            conversationRepository.findFirstByStudentProfileIdAndPathItemId(path.getStudentProfile().getId(), uncompleted.getId())
                    .ifPresent(conversationRepository::delete);
            pathItemRepository.delete(uncompleted);
        }

        Map<String, Object> aiPayload = Map.of(
                "current_goal", path.getGoalText(),
                "modification_intent", modificationIntent,
                "existing_modules", existingModulesData
        );

        Map<String, Object> aiResponse = aiServiceClient.modifyRoadmap(aiPayload);
        List<Map<String, Object>> updatedModules = (List<Map<String, Object>>) aiResponse.get("modules");

        int nextSeq = preservedItems.size() + 1;
        if (updatedModules != null) {
            for (Map<String, Object> m : updatedModules) {
                // If this module title matches an already completed preserved item, skip re-adding
                String topicName = (String) m.get("topic_name");
                boolean alreadyCompleted = preservedItems.stream().anyMatch(p -> p.getTopicName().equalsIgnoreCase(topicName));
                if (alreadyCompleted) continue;

                String title = (String) m.get("title");
                String description = (String) m.get("description");
                String diffStr = (String) m.getOrDefault("difficulty_level", "BEGINNER");
                int estMinutes = ((Number) m.getOrDefault("estimated_minutes", 60)).intValue();

                LearningPathItem.DifficultyLevel diffLevel = LearningPathItem.DifficultyLevel.BEGINNER;
                try {
                    diffLevel = LearningPathItem.DifficultyLevel.valueOf(diffStr.toUpperCase());
                } catch (Exception ignored) {}

                LearningPathItem.ItemStatus itemStatus = (nextSeq == preservedItems.size() + 1) ?
                        LearningPathItem.ItemStatus.UNLOCKED : LearningPathItem.ItemStatus.LOCKED;

                LearningPathItem item = new LearningPathItem(
                        path, title, topicName, description, nextSeq, diffLevel, estMinutes, itemStatus
                );
                item.setIsRemedial(false);
                pathItemRepository.save(item);
                nextSeq++;
            }
        }

        List<LearningPathItem> allNow = pathItemRepository.findByLearningPathIdOrderBySequenceOrderAsc(courseId);
        path.setTotalMilestones(allNow.size());
        pathRepository.save(path);

        return pathRepository.findById(courseId).orElse(path);
    }
}
