package com.example.ubp.auth.util;

import com.example.ubp.auth.security.UserPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class SecurityUtils {
    public static boolean isStaff(UserPrincipal principal) {
        if (principal == null) return false;
        return principal.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))
            || principal.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_STAFF"));
    }

    public static boolean isAdmin(UserPrincipal principal) {
        if (principal == null) return false;
        return principal.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
}
