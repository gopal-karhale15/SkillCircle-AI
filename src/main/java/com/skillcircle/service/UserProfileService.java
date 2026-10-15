
package com.skillcircle.service;

import com.skillcircle.dto.profile.UserProfileResponse;
import com.skillcircle.entity.UserAccount;
import com.skillcircle.entity.UserProfile;
import com.skillcircle.repository.UserAccountRepository;
import com.skillcircle.repository.UserProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class UserProfileService {

    private final UserProfileRepository repository;
    private final UserAccountRepository userAccountRepository;

    public UserProfileService(
            UserProfileRepository repository,
            UserAccountRepository userAccountRepository) {
        this.repository = repository;
        this.userAccountRepository = userAccountRepository;
    }

    @Transactional
    public UserProfile createProfile(
            UserProfile profile,
            String authenticatedEmail) {

        UserAccount account = getAuthenticatedAccount(authenticatedEmail);

        if (repository.existsByOwner_Id(account.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You already have a profile."
            );
        }

        profile.setOwner(account);

        return repository.save(profile);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllProfiles() {
        return repository.findAllByOrderByIdAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<UserProfileResponse> getProfileById(Long id) {
        return repository.findById(id)
                .map(this::toResponse);
    }

    @Transactional
    public UserProfileResponse updateProfile(
            Long id,
            UserProfile updatedProfile,
            String authenticatedEmail) {

        UserProfile existing = getOwnedProfile(id, authenticatedEmail);

        existing.setFullName(updatedProfile.getFullName());
        existing.setEmail(updatedProfile.getEmail());
        existing.setBio(updatedProfile.getBio());
        existing.setSkills(updatedProfile.getSkills());

        return toResponse(repository.save(existing));
    }

    @Transactional
    public void deleteProfile(Long id, String authenticatedEmail) {
        UserProfile existing = getOwnedProfile(id, authenticatedEmail);
        repository.delete(existing);
    }

    private UserProfile getOwnedProfile(
            Long id,
            String authenticatedEmail) {

        String email = normalizeEmail(authenticatedEmail);

        UserProfile profile = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile not found."
                ));

        if (profile.getOwner() == null
                || !normalizeEmail(profile.getOwner().getEmail()).equals(email)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only modify your own profile."
            );
        }

        return profile;
    }

    private UserAccount getAuthenticatedAccount(String email) {
        return userAccountRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated account not found."
                ));
    }

    private UserProfileResponse toResponse(UserProfile profile) {
        String ownerEmail = profile.getOwner() == null
                ? null
                : profile.getOwner().getEmail();

        return new UserProfileResponse(
                profile.getId(),
                profile.getFullName(),
                profile.getEmail(),
                profile.getBio(),
                profile.getSkills(),
                ownerEmail
        );
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return "";
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }
}
