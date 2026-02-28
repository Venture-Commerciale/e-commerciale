package com.example.ubp.auth.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {
    private String issuer;
    private int accessTokenMinutes;
    private int refreshTokenDays;
    private String secret;
}
