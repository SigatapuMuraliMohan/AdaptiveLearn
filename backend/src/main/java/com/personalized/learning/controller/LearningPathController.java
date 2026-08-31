package com.personalized.learning.controller;

import com.personalized.learning.model.LearningPath;
import com.personalized.learning.model.LearningPathItem;
import com.personalized.learning.service.LearningPathService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class LearningPathController {

    private final LearningPathService pathService;

    public LearningPathController(LearningPathService pathService) {
        this.pathService = pathService;
    }

    @PostMapping("/generate")
    public ResponseEntity<LearningPath> createCourse(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(pathService.createCourseRoadmap(authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<LearningPath>> getAllCourses(Authentication authentication) {
        return ResponseEntity.ok(pathService.getAllCoursesForStudent(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPath> getCourseById(
            Authentication authentication,
            @PathVariable Long id) {
        return pathService.getCourseById(id, authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCourse(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(pathService.deleteCourse(id, authentication.getName()));
    }

    @GetMapping("/active")
    public ResponseEntity<LearningPath> getActiveCourse(Authentication authentication) {
        return pathService.getActivePath(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/items/{itemId}/content")
    public ResponseEntity<Map<String, Object>> getLessonContent(
            Authentication authentication,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(pathService.getOrGenerateLessonContent(itemId, authentication.getName()));
    }

    @PutMapping("/items/{id}/complete")
    public ResponseEntity<LearningPathItem> completeItem(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(pathService.completeItemAndUnlockNext(id, authentication.getName()));
    }

    // -------------------------------------------------------------------------
    // Custom Roadmap Item CRUD
    // -------------------------------------------------------------------------

    @PostMapping("/{id}/items")
    public ResponseEntity<LearningPathItem> addCustomItem(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> itemData) {
        return ResponseEntity.ok(pathService.addCustomItem(id, authentication.getName(), itemData));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<LearningPathItem> updateItem(
            Authentication authentication,
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> itemData) {
        return ResponseEntity.ok(pathService.updateItem(itemId, authentication.getName(), itemData));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<LearningPath> deleteItem(
            Authentication authentication,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(pathService.deleteItem(itemId, authentication.getName()));
    }

    // -------------------------------------------------------------------------
    // AI Re-tuning & Goal Adaptation
    // -------------------------------------------------------------------------

    @PostMapping("/{id}/modify-roadmap")
    public ResponseEntity<LearningPath> modifyRoadmapWithAi(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(pathService.modifyRoadmapWithAi(id, authentication.getName(), request));
    }

    @PostMapping("/{id}/adapt-goal")
    public ResponseEntity<LearningPath> adaptCourseGoal(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(pathService.adaptCourseGoal(id, authentication.getName(), request));
    }
}
