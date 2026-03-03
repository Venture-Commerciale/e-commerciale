package com.example.ubp.auth.controller;

import com.example.ubp.TestDataFactory;
import com.example.ubp.auth.dto.RegisterRequest;
import com.example.ubp.auth.dto.LoginRequest;
import com.example.ubp.auth.dto.CreateUserRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:test",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.h2.console.enabled=true"
})
public class AuthControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testRegisterSuccess() throws Exception {
        RegisterRequest request = TestDataFactory.createRegisterRequest("John Doe", "john@example.com", "password123");

        mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.refreshToken").isNotEmpty());
    }

    @Test
    public void testRegisterDuplicateEmail() throws Exception {
        RegisterRequest request1 = TestDataFactory.createRegisterRequest("User 1", "duplicate@example.com", "password123");
        RegisterRequest request2 = TestDataFactory.createRegisterRequest("User 2", "duplicate@example.com", "password456");

        // First registration should succeed
        mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request1)))
            .andExpect(status().isOk());

        // Second registration with same email should fail
        mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request2)))
            .andExpect(status().isBadRequest());
    }

    @Test
    public void testRegisterInvalidEmail() throws Exception {
        RegisterRequest request = TestDataFactory.createRegisterRequest("John Doe", "invalid-email", "password123");

        mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    public void testRegisterShortPassword() throws Exception {
        RegisterRequest request = TestDataFactory.createRegisterRequest("John Doe", "john@example.com", "short");

        mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    public void testAdminCanCreateStaff() throws Exception {
        // first login as seeded admin
        var loginReq = new com.example.ubp.auth.dto.LoginRequest();
        loginReq.setEmail("admin@demo.com");
        loginReq.setPassword("Password123");
        String token = objectMapper.readTree(
            mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
            .andReturn().getResponse().getContentAsString()
            ).get("data").get("accessToken").asText();

        // create staff user
        com.example.ubp.auth.dto.CreateUserRequest req = new com.example.ubp.auth.dto.CreateUserRequest();
        req.setName("Staff Member");
        req.setEmail("newstaff@example.com");
        req.setPassword("password123");
        req.setRole(com.example.ubp.auth.model.RoleName.STAFF);

        mockMvc.perform(post("/api/users")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.email").value("newstaff@example.com"))
            .andExpect(jsonPath("$.data.roles[0]").value("STAFF"));
    }

    @Test
    public void testNonAdminCannotCreateStaff() throws Exception {
        // register a normal user
        RegisterRequest request = TestDataFactory.createRegisterRequest("User", "user@example.com", "password123");
        mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk());

        com.example.ubp.auth.dto.LoginRequest loginReq = new com.example.ubp.auth.dto.LoginRequest();
        loginReq.setEmail("user@example.com");
        loginReq.setPassword("password123");
        String token = objectMapper.readTree(
            mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
            .andReturn().getResponse().getContentAsString()
            ).get("data").get("accessToken").asText();

        com.example.ubp.auth.dto.CreateUserRequest req = new com.example.ubp.auth.dto.CreateUserRequest();
        req.setName("Should Fail");
        req.setEmail("fail@example.com");
        req.setPassword("password123");
        req.setRole(com.example.ubp.auth.model.RoleName.STAFF);

        var result = mockMvc.perform(post("/api/users")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(req)))
            .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
            .andReturn();

        // if the endpoint misbehaves we want to log the body to understand the 500
        String body = result.getResponse().getContentAsString();
        System.out.println("Non-admin create response body: " + body);
        org.junit.jupiter.api.Assertions.assertEquals(403, result.getResponse().getStatus());
    }
}
