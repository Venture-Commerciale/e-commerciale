package com.example.ubp.auth.repo;

import com.example.ubp.TestDataFactory;
import com.example.ubp.auth.model.Role;
import com.example.ubp.auth.model.RoleName;
import com.example.ubp.auth.model.User;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
public class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Role customerRole;

    @BeforeEach
    public void setUp() {
        customerRole = TestDataFactory.createTestRole(RoleName.CUSTOMER);
        customerRole = roleRepository.save(customerRole);
    }

    @Test
    public void testCreateAndSaveUser() {
        User user = TestDataFactory.createTestUser("John Doe", "john@example.com", customerRole);
        User savedUser = userRepository.save(user);

        assertEquals("John Doe", savedUser.getName());
        assertEquals("john@example.com", savedUser.getEmail());
    }

    @Test
    public void testFindByEmail() {
        User user = TestDataFactory.createTestUser("Jane Doe", "jane@example.com", customerRole);
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("jane@example.com");
        assertTrue(found.isPresent());
        assertEquals("Jane Doe", found.get().getName());
    }

    @Test
    public void testFindByEmailNotFound() {
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");
        assertFalse(found.isPresent());
    }

    @Test
    public void testExistsByEmail() {
        User user = TestDataFactory.createTestUser("Alice", "alice@example.com", customerRole);
        userRepository.save(user);

        assertTrue(userRepository.existsByEmail("alice@example.com"));
        assertFalse(userRepository.existsByEmail("bob@example.com"));
    }

    @Test
    public void testUserWithMultipleUsers() {
        User user1 = TestDataFactory.createTestUser("User1", customerRole);
        User user2 = TestDataFactory.createTestUser("User2", customerRole);
        User user3 = TestDataFactory.createTestUser("User3", customerRole);

        userRepository.save(user1);
        userRepository.save(user2);
        userRepository.save(user3);

        assertEquals(3, userRepository.count());
    }
}
