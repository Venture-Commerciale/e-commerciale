package com.example.ubp.auth.controller;

import com.example.ubp.auth.dto.AuthResponse;
import com.example.ubp.auth.dto.LoginRequest;
import com.example.ubp.auth.dto.LogoutRequest;
import com.example.ubp.auth.dto.RefreshRequest;
import com.example.ubp.auth.dto.RegisterRequest;
import com.example.ubp.auth.dto.UserProfileResponse;
import com.example.ubp.auth.security.UserPrincipal;
import com.example.ubp.auth.service.AuthService;
import com.example.ubp.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ApiResponse<>(true, authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return new ApiResponse<>(true, authService.login(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return new ApiResponse<>(true, authService.refresh(request));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody(required = false) LogoutRequest request
    ) {
        authService.logout(principal, request);
        return new ApiResponse<>(true, null);
    }

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        return new ApiResponse<>(true, authService.getProfile(principal));
    }
}
