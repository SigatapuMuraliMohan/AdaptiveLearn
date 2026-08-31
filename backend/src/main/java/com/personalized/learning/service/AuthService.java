package com.personalized.learning.service;

import com.personalized.learning.dto.AuthDTO;
import com.personalized.learning.model.StudentProfile;
import com.personalized.learning.model.User;
import com.personalized.learning.repository.StudentProfileRepository;
import com.personalized.learning.repository.UserRepository;
import com.personalized.learning.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       StudentProfileRepository studentProfileRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
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
}
