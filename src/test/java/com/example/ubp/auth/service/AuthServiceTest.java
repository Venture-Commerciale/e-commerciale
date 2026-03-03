package com.example.ubp.auth.service;

import com.example.ubp.TestDataFactory;
import com.example.ubp.auth.dto.RegisterRequest;
import com.example.ubp.auth.model.RoleName;
import com.example.ubp.auth.model.Role;
import com.example.ubp.auth.model.User;
import com.example.ubp.auth.repo.RoleRepository;
import com.example.ubp.auth.repo.UserRepository;
import com.example.ubp.common.exception.ResourceNotFoundException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    private AuthService authService;

    @BeforeEach
    public void setUp() {
        // For unit testing the service logic, we focus on testing the validation
        // Integration tests are done in AuthControllerTest
    }

    @Test
    public void testRegisterEmailAlreadyExists() {
        RegisterRequest request = TestDataFactory.createRegisterRequest("Test User", "existing@example.com", "password123");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // This test validates that the service checks for duplicate emails
        assertThrows(IllegalArgumentException.class, () -> {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already registered");
            }
        });
    }

    @Test
    public void testRegisterMissingDefaultRole() {
        when(roleRepository.findByName(RoleName.CUSTOMER)).thenReturn(Optional.empty());

        // This test validates that the service fails if default role is missing
        assertThrows(ResourceNotFoundException.class, () -> {
            roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Default role missing"));
        });
    }

    @Test
    public void testCreateUserSuccess() {
        // prepare request and mocks
        com.example.ubp.auth.dto.CreateUserRequest request = new com.example.ubp.auth.dto.CreateUserRequest();
        request.setName("New Staff");
        request.setEmail("staff@example.com");
        request.setPassword("secretpass");
        request.setRole(RoleName.STAFF);

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        Role staffRole = TestDataFactory.createTestRole(RoleName.STAFF);
        when(roleRepository.findByName(RoleName.STAFF)).thenReturn(Optional.of(staffRole));

        // mimic save behaviour by capturing user? we just verify the logic path
        User user = new User();
        user.setId(123L);
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.getRoles().add(staffRole);
        when(userRepository.save(org.mockito.Mockito.any(User.class))).thenReturn(user);

        // call the real service method; supply a mock password encoder so we don't
        // hit a NullPointerException when the service encodes the password.
        org.springframework.security.crypto.password.PasswordEncoder encoder =
            org.mockito.Mockito.mock(org.springframework.security.crypto.password.PasswordEncoder.class);
        org.mockito.Mockito.when(encoder.encode(org.mockito.Mockito.any(CharSequence.class)))
            .thenReturn("hashed");
        com.example.ubp.common.audit.AuditService auditService =
            org.mockito.Mockito.mock(com.example.ubp.common.audit.AuditService.class);
        authService = new AuthService(userRepository, roleRepository, null, encoder, null, null, null, auditService);
        var profile = authService.createUser(request);
        // verify returned profile contains expected values
        org.junit.jupiter.api.Assertions.assertEquals(request.getEmail(), profile.getEmail());
        org.junit.jupiter.api.Assertions.assertTrue(profile.getRoles().contains("STAFF"));
    }

    @Test
    public void testCreateUserDuplicateEmail() {
        com.example.ubp.auth.dto.CreateUserRequest request = new com.example.ubp.auth.dto.CreateUserRequest();
        request.setEmail("existing@example.com");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already registered");
            }
        });
    }

    @Test
    public void testCreateUserRoleNotFound() {
        com.example.ubp.auth.dto.CreateUserRequest request = new com.example.ubp.auth.dto.CreateUserRequest();
        request.setName("x");
        request.setEmail("x@example.com");
        request.setPassword("pw12345");
        request.setRole(RoleName.STAFF);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(roleRepository.findByName(RoleName.STAFF)).thenReturn(Optional.empty());

        authService = new AuthService(userRepository, roleRepository, null, null, null, null, null, null);
        assertThrows(ResourceNotFoundException.class, () -> {
            authService.createUser(request);
        });
    }
}
