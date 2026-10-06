package com.personalized.learning.controller;

import com.personalized.learning.dto.AuthDTO;
import com.personalized.learning.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDTO.AuthResponse> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTO.AuthResponse> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthDTO.AuthResponse> updateProfile(
            org.springframework.security.core.Authentication authentication,
            @RequestBody AuthDTO.UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(authentication.getName(), request));
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<AuthDTO.SendOtpResponse> sendPasswordResetOtp(@Valid @RequestBody AuthDTO.SendOtpRequest request) {
        return ResponseEntity.ok(authService.sendPasswordResetOtp(request.getEmail()));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<AuthDTO.GenericResponse> resetPasswordWithOtp(@Valid @RequestBody AuthDTO.ResetPasswordWithOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtpAndResetPassword(request));
    }
}
