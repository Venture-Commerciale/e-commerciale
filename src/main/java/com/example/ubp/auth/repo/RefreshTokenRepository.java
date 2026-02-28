package com.example.ubp.auth.repo;

import com.example.ubp.auth.model.RefreshToken;
import com.example.ubp.auth.model.User;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHashAndRevokedFalse(String tokenHash);
    long deleteByUser(User user);
    long deleteByExpiresAtBefore(Instant now);
}
