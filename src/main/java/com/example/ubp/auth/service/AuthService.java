package com.example.ubp.auth.service;

import com.example.ubp.auth.dto.AuthResponse;
import com.example.ubp.auth.dto.LoginRequest;
import com.example.ubp.auth.dto.LogoutRequest;
import com.example.ubp.auth.dto.RefreshRequest;
import com.example.ubp.auth.dto.RegisterRequest;
import com.example.ubp.auth.dto.CreateUserRequest;
import com.example.ubp.auth.dto.UserProfileResponse;
import com.example.ubp.auth.model.RefreshToken;
import com.example.ubp.auth.model.Role;
import com.example.ubp.auth.model.RoleName;
import com.example.ubp.auth.model.User;
import com.example.ubp.auth.model.UserStatus;
import com.example.ubp.auth.repo.RefreshTokenRepository;
import com.example.ubp.auth.repo.RoleRepository;
import com.example.ubp.auth.repo.UserRepository;
import com.example.ubp.auth.security.JwtProperties;
import com.example.ubp.auth.security.JwtService;
import com.example.ubp.auth.security.TokenHashing;
import com.example.ubp.auth.security.UserPrincipal;
import com.example.ubp.common.audit.AuditService;
import com.example.ubp.common.exception.ResourceNotFoundException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuditService auditService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
        UserRepository userRepository,
        RoleRepository roleRepository,
        RefreshTokenRepository refreshTokenRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
        JwtService jwtService,
        JwtProperties jwtProperties,
        AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
            .orElseThrow(() -> new ResourceNotFoundException("Default role missing"));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.getRoles().add(customerRole);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        auditService.log(user, "REGISTER", "User", user.getId());

        return issueTokens(user);
    }

    @Transactional
    public UserProfileResponse createUser(com.example.ubp.auth.dto.CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        Role role = roleRepository.findByName(request.getRole())
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.getRoles().add(role);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        auditService.log(user, "CREATE_USER", "User", user.getId());

        // return a lightweight profile response rather than tokens
        return UserProfileResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .status(user.getStatus())
            .roles(user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(java.util.stream.Collectors.toList()))
            .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AuthResponse response = issueTokens(user);
        auditService.log(user, "LOGIN", "User", user.getId());
        return response;
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String tokenHash = TokenHashing.sha256(request.getRefreshToken());
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHashAndRevokedFalse(tokenHash)
            .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new IllegalArgumentException("Refresh token expired");
        }

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        return issueTokens(refreshToken.getUser());
    }

    @Transactional
    public void logout(UserPrincipal principal, LogoutRequest request) {
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            String tokenHash = TokenHashing.sha256(request.getRefreshToken());
            refreshTokenRepository.findByTokenHashAndRevokedFalse(tokenHash)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
            auditService.log(principal.getUser(), "LOGOUT", "User", principal.getUser().getId());
            return;
        }
        refreshTokenRepository.deleteByUser(principal.getUser());
        auditService.log(principal.getUser(), "LOGOUT_ALL", "User", principal.getUser().getId());
    }

    public UserProfileResponse getProfile(UserPrincipal principal) {
        User user = principal.getUser();
        return UserProfileResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .status(user.getStatus())
            .roles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList()))
            .build();
    }

    private AuthResponse issueTokens(User user) {
        List<String> roles = user.getRoles().stream()
            .map(role -> role.getName().name())
            .collect(Collectors.toList());
        String accessToken = jwtService.generateAccessToken(user.getEmail(), roles);

        String refreshToken = generateRefreshToken();
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(TokenHashing.sha256(refreshToken));
        token.setExpiresAt(Instant.now().plusSeconds(jwtProperties.getRefreshTokenDays() * 86400L));
        refreshTokenRepository.save(token);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .roles(roles)
            .build();
    }

    private String generateRefreshToken() {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
