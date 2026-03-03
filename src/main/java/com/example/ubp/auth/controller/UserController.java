package com.example.ubp.auth.controller;

import com.example.ubp.auth.dto.UserProfileResponse;
import com.example.ubp.auth.model.RoleName;
import com.example.ubp.auth.security.UserPrincipal;
import com.example.ubp.auth.service.UserService;
import com.example.ubp.auth.service.AuthService;
import com.example.ubp.common.dto.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserProfileResponse> createUser(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody com.example.ubp.auth.dto.CreateUserRequest request
    ) {
        UserProfileResponse profile = authService.createUser(request);
        return new ApiResponse<>(true, profile);
    }

    @GetMapping
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ApiResponse<Page<UserProfileResponse>> listUsers(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false, defaultValue = "CUSTOMER") RoleName role,
        Pageable pageable
    ) {
        return new ApiResponse<>(true, userService.listUsersByRole(principal.getUser(), role, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ApiResponse<UserProfileResponse> getUser(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        return new ApiResponse<>(true, userService.getUser(principal.getUser(), id));
    }
}