package com.smartboard.smartboard.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import com.smartboard.smartboard.entity.User;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
}
