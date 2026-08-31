package com.personalized.learning.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class AiServiceClient {

    private final RestClient restClient;

    public AiServiceClient(@Value("${app.ai-service.base-url:http://localhost:8000}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public Map<String, Object> chatWithTutor(Map<String, Object> payload) {
        return restClient.post()
                .uri("/ai/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> createCourseRoadmap(Map<String, Object> payload) {
        return restClient.post()
                .uri("/ai/create-course-roadmap")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> modifyRoadmap(Map<String, Object> payload) {
        return restClient.post()
                .uri("/ai/modify-roadmap")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> adaptCourseRoadmap(Map<String, Object> payload) {
        return restClient.post()
                .uri("/ai/adapt-course-roadmap")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> generateDiagnosticAssessment(String goal, String level, Integer weeklyHours) {
        Map<String, Object> payload = Map.of(
                "goal", goal,
                "experience_level", level != null ? level : "BEGINNER",
                "weekly_hours", weeklyHours != null ? weeklyHours : 8
        );
        return restClient.post()
                .uri("/ai/generate-diagnostic-assessment")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> generateRemedialModule(Map<String, Object> payload) {
        return restClient.post()
                .uri("/ai/generate-remedial-module")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> generateLessonContent(Map<String, Object> payload) {
        return restClient.post()
                .uri("/ai/generate-lesson-content")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> generateCustomAssessment(Map<String, Object> payload) {
        return restClient.post()
                .uri("/ai/generate-custom-assessment")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> evaluateDescriptiveAnswer(Map<String, Object> payload) {
        return restClient.post()
                .uri("/ai/evaluate-descriptive")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> getRecommendation(Map<String, Object> payload) {
        return restClient.post()
                .uri("/ai/recommend")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> predictRisk(Map<String, Object> payload) {
        return restClient.post()
                .uri("/ai/predict-risk")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);
    }
}
