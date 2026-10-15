package com.skillcircle.dto.profile;

public record UserProfileResponse(
        Long id,
        String fullName,
        String email,
        String bio,
        String skills,
        String ownerEmail
) {}