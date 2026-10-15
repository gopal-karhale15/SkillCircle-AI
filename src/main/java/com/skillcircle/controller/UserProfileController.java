
package com.skillcircle.controller;

import com.skillcircle.dto.profile.UserProfileResponse;
import com.skillcircle.entity.UserProfile;
import com.skillcircle.service.UserProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/profiles")
public class UserProfileController {

    private final UserProfileService service;

    public UserProfileController(UserProfileService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UserProfileResponse> createProfile(
            @RequestBody UserProfile profile,
            Authentication authentication) {

        UserProfile savedProfile = service.createProfile(
                profile,
                authentication.getName()
        );

        UserProfileResponse response = new UserProfileResponse(
                savedProfile.getId(),
                savedProfile.getFullName(),
                savedProfile.getEmail(),
                savedProfile.getBio(),
                savedProfile.getSkills(),
                savedProfile.getOwner() == null
                        ? null
                        : savedProfile.getOwner().getEmail()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<UserProfileResponse> getAllProfiles() {
        return service.getAllProfiles();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getProfileById(
            @PathVariable Long id) {

        return service.getProfileById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @PathVariable Long id,
            @RequestBody UserProfile profile,
            Authentication authentication) {

        UserProfileResponse updatedProfile = service.updateProfile(
                id,
                profile,
                authentication.getName()
        );

        return ResponseEntity.ok(updatedProfile);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(
            @PathVariable Long id,
            Authentication authentication) {

        service.deleteProfile(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
