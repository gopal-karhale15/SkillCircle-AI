
package com.skillcircle.repository;

import com.skillcircle.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserProfileRepository
        extends JpaRepository<UserProfile, Long> {

    List<UserProfile> findAllByOrderByIdAsc();

    Optional<UserProfile> findByOwner_Id(Long ownerId);

    Optional<UserProfile> findByIdAndOwner_Email(
            Long id,
            String email
    );

    boolean existsByOwner_Id(Long ownerId);
}
