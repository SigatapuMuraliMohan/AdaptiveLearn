package com.personalized.learning.controller;

import com.personalized.learning.model.ChatMessage;
import com.personalized.learning.service.AiTutorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutor")
public class AiTutorController {

    private final AiTutorService tutorService;

    public AiTutorController(AiTutorService tutorService) {
        this.tutorService = tutorService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chatWithTutor(
            Authentication authentication,
            @RequestBody Map<String, Object> payload) {
        Long itemId = payload.get("itemId") != null ? Long.valueOf(payload.get("itemId").toString()) : null;
        String message = (String) payload.getOrDefault("message", "");
        return ResponseEntity.ok(tutorService.sendMessage(authentication.getName(), itemId, message));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable Long conversationId) {
        return ResponseEntity.ok(tutorService.getConversationHistory(conversationId));
    }
}
