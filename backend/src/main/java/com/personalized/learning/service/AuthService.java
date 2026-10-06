package com.personalized.learning.service;

import com.personalized.learning.dto.AuthDTO;
import com.personalized.learning.model.PasswordResetOtp;
import com.personalized.learning.model.StudentProfile;
import com.personalized.learning.model.User;
import com.personalized.learning.repository.PasswordResetOtpRepository;
import com.personalized.learning.repository.StudentProfileRepository;
import com.personalized.learning.repository.UserRepository;
import com.personalized.learning.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       StudentProfileRepository studentProfileRepository,
                       PasswordResetOtpRepository otpRepository,
                       EmailService emailService,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        User.Role role = "ADMIN".equalsIgnoreCase(request.getRole()) ? User.Role.ADMIN : User.Role.STUDENT;
        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                role
        );
        user = userRepository.save(user);

        StudentProfile profile = null;
        if (role == User.Role.STUDENT) {
            profile = new StudentProfile(user);
            profile = studentProfileRepository.save(profile);
        }

        String token = jwtUtils.generateJwtToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthDTO.AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                profile != null ? profile.getId() : null,
                profile != null ? profile.getOnboardingCompleted() : false
        );
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);
        String token = jwtUtils.generateJwtToken(user.getEmail(), user.getRole().name(), user.getId());

        return new AuthDTO.AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                profile != null ? profile.getId() : null,
                profile != null ? profile.getOnboardingCompleted() : false
        );
    }

    @Transactional
    public AuthDTO.AuthResponse updateProfile(String email, AuthDTO.UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getFullName() != null && !request.getFullName().trim().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().trim().isBlank()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new IllegalArgumentException("Current password is required to change password.");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                throw new IllegalArgumentException("Current password does not match.");
            }
            if (request.getNewPassword().trim().length() < 6) {
                throw new IllegalArgumentException("New password must be at least 6 characters.");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword().trim()));
        }

        user = userRepository.save(user);

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);
        String token = jwtUtils.generateJwtToken(user.getEmail(), user.getRole().name(), user.getId());

        return new AuthDTO.AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                profile != null ? profile.getId() : null,
                profile != null ? profile.getOnboardingCompleted() : false
        );
    }

    @Transactional
    public AuthDTO.SendOtpResponse sendPasswordResetOtp(String email) {
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email address."));

        // Generate 6-digit numeric OTP
        SecureRandom random = new SecureRandom();
        int otpNumber = 100000 + random.nextInt(900000);
        String otp = String.valueOf(otpNumber);

        // Expire in 10 minutes
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        PasswordResetOtp resetOtp = new PasswordResetOtp(cleanEmail, otp, expiresAt);
        otpRepository.save(resetOtp);

        // Send Email via EmailService (attempts Gmail SMTP)
        boolean delivered = emailService.sendOtpEmail(cleanEmail, otp);

        if (delivered) {
            return new AuthDTO.SendOtpResponse(true, "A 6-digit verification code has been dispatched to " + cleanEmail, null);
        } else {
            // SMTP delivery was rejected (e.g. Gmail App Password not yet configured).
            // Provide the dev OTP preview so the developer / tester is not blocked!
            return new AuthDTO.SendOtpResponse(true,
                    "Verification code generated. (SMTP App Password not configured; use Dev Code: " + otp + ")",
                    otp);
        }
    }

    @Transactional
    public AuthDTO.GenericResponse verifyOtpAndResetPassword(AuthDTO.ResetPasswordWithOtpRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        String submittedOtp = request.getOtp().trim();
        String newPassword = request.getNewPassword().trim();

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with this email."));

        PasswordResetOtp activeOtp = otpRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("No active verification code found. Please request a new code."));

        if (activeOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired. Please request a new code.");
        }

        if (!activeOtp.getOtp().equals(submittedOtp)) {
            throw new IllegalArgumentException("Invalid verification code. Please check your email and try again.");
        }

        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters.");
        }

        // Update password with BCrypt hash
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark OTP as used
        activeOtp.setUsed(true);
        otpRepository.save(activeOtp);

        return new AuthDTO.GenericResponse(true, "Password has been successfully updated. You can now login with your new password.");
    }
}
