
package com.skillcircle.service;

import com.skillcircle.entity.UserProfile;
import com.skillcircle.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserProfileService {

    private final UserProfileRepository repository;

    public UserProfileService(UserProfileRepository repository) {
        this.repository = repository;
    }

    public UserProfile createProfile(UserProfile profile) {
        return repository.save(profile);
    }

    public List<UserProfile> getAllProfiles() {
        return repository.findAll();
    }

    public Optional<UserProfile> getProfileById(Long id) {
        return repository.findById(id);
    }
}
