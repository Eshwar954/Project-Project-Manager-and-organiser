package com.smartboard.smartboard.config;

import com.smartboard.smartboard.entity.Project;
import com.smartboard.smartboard.entity.Task;
import com.smartboard.smartboard.entity.User;
import com.smartboard.smartboard.repository.ProjectRepository;
import com.smartboard.smartboard.repository.TasksRepository;
import com.smartboard.smartboard.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
        UserRepository    userRepo,
        ProjectRepository projectRepo,
        TasksRepository    taskRepo,
        PasswordEncoder   passwordEncoder
    ) {
        return args -> {

            if (userRepo.count() > 0) return;

            User surya = new User();
            surya.setName("Surya");
            surya.setEmail("surya@test.com");
            surya.setPassword(passwordEncoder.encode("123456"));
            surya = userRepo.save(surya);

            User alice = new User();
            alice.setName("Alice");
            alice.setEmail("alice@test.com");
            alice.setPassword(passwordEncoder.encode("123456"));
            alice = userRepo.save(alice);

            User bob = new User();
            bob.setName("Bob");
            bob.setEmail("bob@test.com");
            bob.setPassword(passwordEncoder.encode("123456"));
            bob = userRepo.save(bob);

            Project p1 = new Project();
            p1.setName("Website Redesign");
            p1.setOwnerId(surya.getId());
            p1.setMemberIds(new ArrayList<>());
            p1.getMemberIds().add(surya.getId());
            p1.getMemberIds().add(alice.getId());
            p1.getMemberIds().add(bob.getId());
            p1 = projectRepo.save(p1);

            Task t1 = new Task();
            t1.setTitle("Design homepage mockup");
            t1.setProjectId(p1.getId());
            t1.setAssignedTo(alice.getId());
            t1.setCompleted(true);
            taskRepo.save(t1);

            Task t2 = new Task();
            t2.setTitle("Build navigation component");
            t2.setProjectId(p1.getId());
            t2.setAssignedTo(bob.getId());
            t2.setCompleted(false);
            taskRepo.save(t2);

            Task t3 = new Task();
            t3.setTitle("Write landing page copy");
            t3.setProjectId(p1.getId());
            t3.setAssignedTo(alice.getId());
            t3.setCompleted(false);
            taskRepo.save(t3);

            Task t4 = new Task();
            t4.setTitle("Setup CI/CD pipeline");
            t4.setProjectId(p1.getId());
            t4.setAssignedTo(surya.getId());
            t4.setCompleted(true);
            taskRepo.save(t4);

            Project p2 = new Project();
            p2.setName("Mobile App MVP");
            p2.setOwnerId(alice.getId());
            p2.setMemberIds(new ArrayList<>());
            p2.getMemberIds().add(alice.getId());
            p2.getMemberIds().add(surya.getId());
            p2 = projectRepo.save(p2);

            Task t5 = new Task();
            t5.setTitle("Setup React Native project");
            t5.setProjectId(p2.getId());
            t5.setAssignedTo(surya.getId());
            t5.setCompleted(true);
            taskRepo.save(t5);

            Task t6 = new Task();
            t6.setTitle("Design login screen");
            t6.setProjectId(p2.getId());
            t6.setAssignedTo(alice.getId());
            t6.setCompleted(false);
            taskRepo.save(t6);

            Task t7 = new Task();
            t7.setTitle("Integrate REST API");
            t7.setProjectId(p2.getId());
            t7.setAssignedTo(surya.getId());
            t7.setCompleted(false);
            taskRepo.save(t7);

            Project p3 = new Project();
            p3.setName("Internal Dashboard");
            p3.setOwnerId(bob.getId());
            p3.setMemberIds(new ArrayList<>());
            p3.getMemberIds().add(bob.getId());
            p3.getMemberIds().add(alice.getId());
            p3 = projectRepo.save(p3);

            Task t8 = new Task();
            t8.setTitle("Create charts component");
            t8.setProjectId(p3.getId());
            t8.setAssignedTo(alice.getId());
            t8.setCompleted(false);
            taskRepo.save(t8);

            Task t9 = new Task();
            t9.setTitle("Connect to analytics API");
            t9.setProjectId(p3.getId());
            t9.setAssignedTo(bob.getId());
            t9.setCompleted(true);
            taskRepo.save(t9);

            Task t10 = new Task();
            t10.setTitle("Write user docs");
            t10.setProjectId(p3.getId());
            t10.setAssignedTo(bob.getId());
            t10.setCompleted(false);
            taskRepo.save(t10);

            System.out.println("Seeded 3 users, 3 projects, 10 tasks");
        };
    }
}