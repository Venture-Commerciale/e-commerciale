package com.example.ubp.auth.service;

import com.example.ubp.auth.model.Role;
import com.example.ubp.auth.model.RoleName;
import com.example.ubp.auth.model.User;
import com.example.ubp.auth.model.UserStatus;
import com.example.ubp.auth.repo.RoleRepository;
import com.example.ubp.auth.repo.UserRepository;
import java.util.Set;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class DemoUserInitializer implements ApplicationRunner {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoUserInitializer(
        UserRepository userRepository,
        RoleRepository roleRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        createUserIfMissing("admin@demo.com", "Admin User", RoleName.ADMIN);
        createUserIfMissing("staff@demo.com", "Staff User", RoleName.STAFF);
        createUserIfMissing("customer@demo.com", "Customer User", RoleName.CUSTOMER);
    }

    private void createUserIfMissing(String email, String name, RoleName roleName) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new IllegalStateException("Role missing: " + roleName));
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPasswordHash(passwordEncoder.encode("Password123"));
        user.setRoles(Set.of(role));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }
}
