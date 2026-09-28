package com.accessflow.service;

import com.accessflow.audit.AuditAction;
import com.accessflow.audit.AuditService;
import com.accessflow.dto.LoginRequest;
import com.accessflow.dto.LoginResponse;
import com.accessflow.dto.RegisterRequest;
import com.accessflow.dto.UserResponse;
import com.accessflow.entity.User;
import com.accessflow.entity.enums.UserRole;
import com.accessflow.exception.BadRequestException;
import com.accessflow.mapper.UserMapper;
import com.accessflow.repository.UserRepository;
import com.accessflow.security.CustomUserDetails;
import com.accessflow.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        AuthenticationManager authenticationManager,
                        JwtUtil jwtUtil,
                        AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.auditService = auditService;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (BadCredentialsException ex) {
            auditService.record(null, AuditAction.USER_LOGIN_FAILED, "User", user.getId());
            throw ex;
        }

        if (!user.isActive()) {
            throw new BadCredentialsException("This account has been deactivated.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        auditService.record(user, AuditAction.USER_LOGIN, "User", user.getId());

        return new LoginResponse(token, UserMapper.toResponse(user));
    }

    /**
     * Public self-registration always creates an EMPLOYEE account with no
     * manager assigned; an administrator must assign a manager and may
     * change the role afterwards via the user-management APIs (Phase 6).
     */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("An account with this email already exists.");
        }

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.EMPLOYEE)
                .active(true)
                .build();

        user = userRepository.save(user);
        auditService.record(user, AuditAction.USER_REGISTERED, "User", user.getId());

        return UserMapper.toResponse(user);
    }

    public UserResponse getCurrentUser(CustomUserDetails principal) {
        return UserMapper.toResponse(principal.getUser());
    }
}
