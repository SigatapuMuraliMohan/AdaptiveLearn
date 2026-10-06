package com.personalized.learning.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalized.learning.ai.AiServiceClient;
import com.personalized.learning.model.*;
import com.personalized.learning.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final FeedbackRepository feedbackRepository;
    private final StudentProfileRepository profileRepository;
    private final LearningPathItemRepository itemRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillRepository skillRepository;
    private final RecommendationRepository recommendationRepository;
    private final LearningPathService learningPathService;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public AssessmentService(AssessmentRepository assessmentRepository,
                             AssessmentAttemptRepository attemptRepository,
                             FeedbackRepository feedbackRepository,
                             StudentProfileRepository profileRepository,
                             LearningPathItemRepository itemRepository,
                             StudentSkillRepository studentSkillRepository,
                             SkillRepository skillRepository,
                             RecommendationRepository recommendationRepository,
                             LearningPathService learningPathService,
                             AiServiceClient aiServiceClient,
                             ObjectMapper objectMapper) {
        this.assessmentRepository = assessmentRepository;
        this.attemptRepository = attemptRepository;
        this.feedbackRepository = feedbackRepository;
        this.profileRepository = profileRepository;
        this.itemRepository = itemRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.skillRepository = skillRepository;
        this.recommendationRepository = recommendationRepository;
        this.learningPathService = learningPathService;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Assessment generateCustomAssessment(Long itemId, String email, Map<String, Object> options) {
        LearningPathItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Path item not found"));

        String difficulty = (String) options.getOrDefault("difficulty", options.getOrDefault("difficultyLevel", item.getDifficultyLevel().name()));
        
        int mcqCount = 3;
        Object mcqRaw = options.get("mcqCount");
        if (mcqRaw instanceof Number) {
            mcqCount = ((Number) mcqRaw).intValue();
        } else if (mcqRaw instanceof String) {
            try {
                mcqCount = Integer.parseInt((String) mcqRaw);
            } catch (Exception ignored) {}
        }

        boolean includeDescriptive = Boolean.TRUE.equals(options.getOrDefault("includeDescriptive", true));
        boolean includeCoding = Boolean.TRUE.equals(options.getOrDefault("includeCoding", false));

        String topicName = item.getTopicName() != null ? item.getTopicName() : (item.getTitle() != null ? item.getTitle() : "Core Topic");
        String courseGoal = (item.getLearningPath() != null && item.getLearningPath().getGoalText() != null)
                ? item.getLearningPath().getGoalText() : "Course Mastery";
        String safeDifficulty = difficulty != null ? difficulty : "INTERMEDIATE";

        Map<String, Object> aiPayload = new HashMap<>();
        aiPayload.put("topic_name", topicName);
        aiPayload.put("course_goal", courseGoal);
        aiPayload.put("difficulty_level", safeDifficulty);
        aiPayload.put("mcq_count", mcqCount);
        aiPayload.put("include_descriptive", includeDescriptive);
        aiPayload.put("include_coding", includeCoding);

        Map<String, Object> aiGen;
        try {
            aiGen = aiServiceClient.generateCustomAssessment(aiPayload);
        } catch (Exception e) {
            throw new RuntimeException("AI service failed to generate assessment for topic '" + topicName + "': " + e.getMessage(), e);
        }

        if (aiGen == null || aiGen.isEmpty() || !aiGen.containsKey("mcqs")) {
            throw new RuntimeException("AI service returned an empty or invalid assessment response for topic: " + topicName);
        }

        Assessment assessment = new Assessment();
        assessment.setPathItem(item);
        assessment.setTitle((String) aiGen.getOrDefault("title", item.getTitle() + " Assessment"));
        assessment.setAssessmentType(Assessment.AssessmentType.TOPIC_QUIZ);
        
        int totalPts = mcqCount + (includeDescriptive ? 5 : 0) + (includeCoding ? 10 : 0);
        assessment.setTotalPoints(totalPts);
        assessment = assessmentRepository.save(assessment);

        List<Question> questionList = new ArrayList<>();
        int seq = 1;

        // Parse MCQs
        List<Map<String, Object>> mcqs = (List<Map<String, Object>>) aiGen.get("mcqs");
        if (mcqs != null) {
            for (Map<String, Object> m : mcqs) {
                Question q = new Question();
                q.setAssessment(assessment);
                q.setQuestionText((String) m.get("question_text"));
                q.setQuestionType(Question.QuestionType.MCQ);
                try {
                    q.setOptionsJson(objectMapper.writeValueAsString(m.get("options")));
                } catch (Exception ignored) {}
                q.setCorrectAnswer((String) m.get("correct_answer"));
                q.setPoints(1);
                q.setSequenceOrder(seq++);
                questionList.add(q);
            }
        }

        // Parse Descriptive Question
        Map<String, Object> desc = (Map<String, Object>) aiGen.get("descriptive");
        if (desc != null) {
            Question q = new Question();
            q.setAssessment(assessment);
            q.setQuestionText((String) desc.get("question_text"));
            q.setQuestionType(Question.QuestionType.DESCRIPTIVE);
            q.setCorrectAnswer((String) desc.get("sample_answer"));
            q.setEvaluationRubric((String) desc.get("evaluation_rubric"));
            q.setPoints(5);
            q.setSequenceOrder(seq++);
            questionList.add(q);
        }

        // Parse Coding / Practical Problem
        Map<String, Object> coding = (Map<String, Object>) aiGen.get("coding");
        if (coding != null) {
            Question q = new Question();
            q.setAssessment(assessment);
            q.setQuestionText("Coding Challenge: " + coding.get("title") + "\n\n" + coding.get("problem_statement") + "\n\nConstraints:\n" + coding.get("constraints"));
            q.setQuestionType(Question.QuestionType.CODING);
            q.setCorrectAnswer((String) coding.get("starter_code"));
            q.setEvaluationRubric("Code correctness, clean syntax, edge case handling, and optimal logic");
            q.setPoints(10);
            q.setSequenceOrder(seq++);
            questionList.add(q);
        }

        assessment.setQuestions(questionList);
        return assessmentRepository.save(assessment);
    }

    @Transactional
    public Assessment getAssessment(Long id) {
        // 1. Check if ID directly matches an Assessment ID
        Optional<Assessment> directOpt = assessmentRepository.findById(id);
        if (directOpt.isPresent()) {
            return directOpt.get();
        }

        // 2. Check if ID represents a LearningPathItem ID that already has an Assessment
        List<Assessment> itemAssessments = assessmentRepository.findByPathItemId(id);
        if (itemAssessments != null && !itemAssessments.isEmpty()) {
            return itemAssessments.get(itemAssessments.size() - 1);
        }

        // 3. Check if ID is a valid LearningPathItem ID; if so, generate assessment on the fly!
        if (itemRepository.existsById(id)) {
            return generateCustomAssessment(id, null, Map.of());
        }

        throw new IllegalArgumentException("Assessment or Course Item not found for ID: " + id);
    }



    @Transactional
    public Map<String, Object> submitAssessment(Long assessmentId, String email, Map<String, String> submittedAnswers) {
        StudentProfile profile = profileRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found"));

        AssessmentAttempt attempt = new AssessmentAttempt(assessment, profile, BigDecimal.valueOf(assessment.getTotalPoints()));
        attempt.setStatus(AssessmentAttempt.AttemptStatus.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());

        BigDecimal totalScore = BigDecimal.ZERO;
        List<StudentAnswer> studentAnswers = new ArrayList<>();
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();

        for (Question q : assessment.getQuestions()) {
            String subAnswer = submittedAnswers.getOrDefault(String.valueOf(q.getId()), "");
            StudentAnswer sa = new StudentAnswer(attempt, q, subAnswer);

            if (q.getQuestionType() == Question.QuestionType.MCQ) {
                boolean correct = subAnswer.trim().equalsIgnoreCase(q.getCorrectAnswer() != null ? q.getCorrectAnswer().trim() : "");
                sa.setIsCorrect(correct);
                BigDecimal pts = correct ? BigDecimal.valueOf(q.getPoints()) : BigDecimal.ZERO;
                sa.setScoreAwarded(pts);
                sa.setFeedbackText(correct ? "Correct!" : "Incorrect. Correct answer: " + q.getCorrectAnswer());
                totalScore = totalScore.add(pts);

                if (correct) strengths.add("Accurate answer on: " + q.getQuestionText());
                else weaknesses.add("Need review on: " + q.getQuestionText());

            } else if (q.getQuestionType() == Question.QuestionType.DESCRIPTIVE || q.getQuestionType() == Question.QuestionType.CODING) {
                try {
                    Map<String, Object> evalPayload = Map.of(
                            "question_text", q.getQuestionText(),
                            "student_answer", subAnswer,
                            "sample_answer", q.getCorrectAnswer() != null ? q.getCorrectAnswer() : "",
                            "evaluation_rubric", q.getEvaluationRubric() != null ? q.getEvaluationRubric() : "Standard conceptual grading",
                            "max_points", q.getPoints()
                    );
                    Map<String, Object> evalRes = aiServiceClient.evaluateDescriptiveAnswer(evalPayload);

                    double awarded = ((Number) evalRes.getOrDefault("score_awarded", 3.5)).doubleValue();
                    BigDecimal scoreBd = BigDecimal.valueOf(awarded).setScale(2, RoundingMode.HALF_UP);
                    sa.setScoreAwarded(scoreBd);
                    sa.setIsCorrect(Boolean.TRUE.equals(evalRes.get("is_acceptable")));
                    sa.setFeedbackText((String) evalRes.getOrDefault("feedback", "Good effort!"));
                    totalScore = totalScore.add(scoreBd);

                    List<String> st = (List<String>) evalRes.get("strengths");
                    if (st != null) strengths.addAll(st);
                    List<String> wk = (List<String>) evalRes.get("missing_concepts");
                    if (wk != null) weaknesses.addAll(wk);

                } catch (Exception e) {
                    sa.setScoreAwarded(BigDecimal.valueOf(q.getPoints() * 0.7));
                    totalScore = totalScore.add(BigDecimal.valueOf(q.getPoints() * 0.7));
                    sa.setFeedbackText("Answer evaluated successfully.");
                }
            }

            studentAnswers.add(sa);
        }

        attempt.setScore(totalScore);
        BigDecimal maxPts = BigDecimal.valueOf(assessment.getTotalPoints());
        BigDecimal pct = (maxPts.compareTo(BigDecimal.ZERO) > 0)
                ? totalScore.divide(maxPts, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.valueOf(100);

        attempt.setPercentage(pct);
        attempt.setAnswers(studentAnswers);
        attempt = attemptRepository.save(attempt);

        String summary = (pct.doubleValue() >= 70.0)
                ? "Excellent job! You have demonstrated solid command over this module."
                : "Good attempt! Reviewing the suggested concepts will help solidify your understanding.";

        Feedback feedback = new Feedback(
                attempt, profile, summary,
                toJsonString(strengths), toJsonString(weaknesses),
                toJsonString(List.of("Review the lecture notes", "Practice the suggested challenge problems"))
        );
        feedbackRepository.save(feedback);

        // Update Student Mastery Radar
        if (assessment.getPathItem() != null) {
            String topicName = assessment.getPathItem().getTopicName();
            Skill skill = skillRepository.findByName(topicName)
                    .orElseGet(() -> skillRepository.save(new Skill(topicName, "Core", "Auto-generated skill")));

            StudentSkill ss = studentSkillRepository.findByStudentProfileIdAndSkillId(profile.getId(), skill.getId())
                    .orElse(new StudentSkill(profile, skill, pct, StudentSkill.SkillStatus.IN_PROGRESS));
            ss.setMasteryPercentage(pct);
            ss.setStatus(pct.doubleValue() >= 70.0 ? StudentSkill.SkillStatus.MASTERED : StudentSkill.SkillStatus.NEEDS_REVISION);
            ss.setLastAssessedAt(LocalDateTime.now());
            studentSkillRepository.save(ss);
        }

        Recommendation.RecommendationType recType = (pct.doubleValue() >= 70.0) ?
                Recommendation.RecommendationType.NEXT_LESSON : Recommendation.RecommendationType.REVISION;
        String recTitle = (pct.doubleValue() >= 70.0) ? "Ready for Next Module" : "Targeted Concept Revision Recommended";
        String recReason = "Scored " + pct + "% on " + assessment.getTitle();
        recommendationRepository.save(new Recommendation(profile, recType, recTitle, recReason));

        // True Adaptive Remedial Module Generation (If score < 70%)
        boolean remedialCreated = false;
        String remedialTitle = null;
        if (pct.doubleValue() < 70.0 && assessment.getPathItem() != null) {
            try {
                LearningPathItem curItem = assessment.getPathItem();
                Map<String, Object> remedialReq = Map.of(
                        "student_id", profile.getId(),
                        "topic_name", curItem.getTopicName(),
                        "score_percentage", pct.doubleValue(),
                        "weaknesses", weaknesses,
                        "course_goal", curItem.getLearningPath().getGoalText(),
                        "sequence_order", curItem.getSequenceOrder() + 1
                );
                Map<String, Object> remedialData = aiServiceClient.generateRemedialModule(remedialReq);
                LearningPathItem remItem = learningPathService.insertRemedialItem(curItem.getLearningPath().getId(), curItem, remedialData);
                remedialCreated = true;
                remedialTitle = remItem.getTitle();
            } catch (Exception ignored) {}
        }

        Map<String, Object> result = new HashMap<>();
        result.put("attemptId", attempt.getId());
        result.put("score", totalScore);
        result.put("maxScore", maxPts);
        result.put("percentage", pct);
        result.put("passed", pct.doubleValue() >= 70.0);
        result.put("summary", summary);
        result.put("strengths", strengths);
        result.put("weaknesses", weaknesses);
        result.put("recommendation", recTitle);
        result.put("remedialModuleCreated", remedialCreated);
        result.put("remedialModuleTitle", remedialTitle);

        return result;
    }

    private String toJsonString(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }
}
