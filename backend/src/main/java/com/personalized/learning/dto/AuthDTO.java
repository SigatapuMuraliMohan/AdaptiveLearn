package com.personalized.learning.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTO {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String role = "STUDENT";

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class AuthResponse {
        private String token;
        private Long userId;
        private String email;
        private String fullName;
        private String role;
        private Long profileId;
        private Boolean onboardingCompleted;

        public AuthResponse(String token, Long userId, String email, String fullName, String role, Long profileId, Boolean onboardingCompleted) {
            this.token = token;
            this.userId = userId;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.profileId = profileId;
            this.onboardingCompleted = onboardingCompleted;
        }

        public String getToken() { return token; }
        public Long getUserId() { return userId; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
        public Long getProfileId() { return profileId; }
        public Boolean getOnboardingCompleted() { return onboardingCompleted; }
    }

    public static class UpdateProfileRequest {
        private String fullName;
        private String currentPassword;
        private String newPassword;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class SendOtpRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ResetPasswordWithOtpRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "OTP is required")
        @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
        private String otp;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String newPassword;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class GenericResponse {
        private boolean success;
        private String message;

        public GenericResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }

    public static class SendOtpResponse {
        private boolean success;
        private String message;
        private String devOtpPreview;

        public SendOtpResponse(boolean success, String message, String devOtpPreview) {
            this.success = success;
            this.message = message;
            this.devOtpPreview = devOtpPreview;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public String getDevOtpPreview() { return devOtpPreview; }
    }
}
