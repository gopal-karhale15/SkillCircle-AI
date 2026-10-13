
package com.skillcircle.service;

import com.skillcircle.dto.auth.LoginRequest;
import com.skillcircle.dto.auth.SignupRequest;
import com.skillcircle.entity.UserAccount;
import com.skillcircle.repository.UserAccountRepository;
import com.skillcircle.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public String signup(SignupRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userAccountRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        UserAccount user = new UserAccount();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        userAccountRepository.save(user);

        return jwtService.generateToken(email);
    }

    @Transactional(readOnly = true)
    public String login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        UserAccount user = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid email or password."
                ));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {
            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        return jwtService.generateToken(user.getEmail());
    }
}
