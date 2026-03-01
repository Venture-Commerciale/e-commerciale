package com.example.ubp.auth.repo;

import com.example.ubp.auth.model.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // query users by role name (e.g. STAFF, CUSTOMER)
    Page<User> findByRolesName(com.example.ubp.auth.model.RoleName role, Pageable pageable);
}
