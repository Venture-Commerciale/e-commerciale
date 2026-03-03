package com.example.ubp;

import com.example.ubp.auth.dto.RegisterRequest;
import com.example.ubp.auth.model.Role;
import com.example.ubp.auth.model.RoleName;
import com.example.ubp.auth.model.User;
import com.example.ubp.auth.model.UserStatus;
import java.time.Instant;

public class TestDataFactory {
    private static int emailCounter = 0;

    public static User createTestUser(String name, String email, Role customerRole) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash("$2a$10$dummy.hashed.password");
        user.setStatus(UserStatus.ACTIVE);
        if (customerRole != null) {
            user.getRoles().add(customerRole);
        }
        user.setCreatedAt(Instant.now());
        return user;
    }

    public static User createTestUser(String name, Role customerRole) {
        return createTestUser(name, "test" + (emailCounter++) + "@example.com", customerRole);
    }

    public static User createTestUser() {
        return createTestUser("Test User", "testuser" + (emailCounter++) + "@example.com", null);
    }

    public static RegisterRequest createRegisterRequest(String name, String email, String password) {
        RegisterRequest request = new RegisterRequest();
        request.setName(name);
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }

    public static RegisterRequest createRegisterRequest() {
        return createRegisterRequest("New User", "newuser" + (emailCounter++) + "@example.com", "password123");
    }

    public static Role createTestRole(RoleName roleName) {
        Role role = new Role();
        role.setName(roleName);
        return role;
    }
}
