package com.smartboard.smartboard.repository;
import java.util.List;
import com.smartboard.smartboard.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project,Long> {
    List<Project> findByOwnerIdOrMemberIdsContaining(Long ownerId, Long memberId);
}
