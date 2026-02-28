package com.example.ubp.auth.dto;

import com.example.ubp.auth.model.UserStatus;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private UserStatus status;
    private List<String> roles;
}
