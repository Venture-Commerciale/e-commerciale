package com.example.ubp.auth.repo;

import com.example.ubp.auth.model.Role;
import com.example.ubp.auth.model.RoleName;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
