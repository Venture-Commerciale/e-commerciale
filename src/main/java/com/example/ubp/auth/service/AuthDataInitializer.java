package com.example.ubp.auth.service;

import com.example.ubp.auth.model.Role;
import com.example.ubp.auth.model.RoleName;
import com.example.ubp.auth.repo.RoleRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;

@Component
@Order(1)
public class AuthDataInitializer implements ApplicationRunner {
    private final RoleRepository roleRepository;

    public AuthDataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureRole(RoleName.ADMIN);
        ensureRole(RoleName.STAFF);
        ensureRole(RoleName.CUSTOMER);
    }

    private void ensureRole(RoleName roleName) {
        roleRepository.findByName(roleName)
            .orElseGet(() -> {
                Role role = new Role();
                role.setName(roleName);
                return roleRepository.save(role);
            });
    }
}
