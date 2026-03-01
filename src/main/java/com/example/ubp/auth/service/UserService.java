package com.example.ubp.auth.service;

import com.example.ubp.auth.dto.UserProfileResponse;
import com.example.ubp.auth.model.RoleName;
import com.example.ubp.auth.model.User;
import com.example.ubp.auth.repo.UserRepository;
import com.example.ubp.common.audit.AuditService;
import com.example.ubp.common.exception.ResourceNotFoundException;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public Page<UserProfileResponse> listUsersByRole(User actor, RoleName role, Pageable pageable) {
        Page<UserProfileResponse> page = userRepository.findByRolesName(role, pageable)
            .map(this::toProfileResponse);
        // role name does not map to a numeric id, log generic listing without entityId
        auditService.log(actor, "LIST_USERS", "Role", null);
        return page;
    }

    public UserProfileResponse getUser(User actor, Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        auditService.log(actor, "VIEW_USER", "User", id);
        return toProfileResponse(user);
    }

    private UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .status(user.getStatus())
            .roles(user.getRoles().stream()
                .map(r -> "ROLE_" + r.getName().name())
                .collect(Collectors.toList()))
            .build();
    }
}