package com.smartboard.smartboard.config;

import com.smartboard.smartboard.entity.Comment;
import com.smartboard.smartboard.entity.Project;
import com.smartboard.smartboard.entity.Task;
import com.smartboard.smartboard.entity.User;
import com.smartboard.smartboard.repository.CommentRepository;
import com.smartboard.smartboard.repository.ProjectRepository;
import com.smartboard.smartboard.repository.TasksRepository;
import com.smartboard.smartboard.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
        UserRepository    userRepo,
        ProjectRepository projectRepo,
        TasksRepository   taskRepo,
        CommentRepository commentRepo,
        PasswordEncoder   passwordEncoder
    ) {
        return args -> {

            if (userRepo.count() > 0) return;

            // ── Users ──────────────────────────────────────────────────────────────
            User surya = save(userRepo, passwordEncoder, "Surya",   "surya@test.com",   "123456");
            User alice = save(userRepo, passwordEncoder, "Alice",   "alice@test.com",   "123456");
            User bob   = save(userRepo, passwordEncoder, "Bob",     "bob@test.com",     "123456");
            User diana = save(userRepo, passwordEncoder, "Diana",   "diana@test.com",   "123456");
            User evan  = save(userRepo, passwordEncoder, "Evan",    "evan@test.com",    "123456");
            User fiona = save(userRepo, passwordEncoder, "Fiona",   "fiona@test.com",   "123456");

            // ── Project 1: Website Redesign (Surya owns) ───────────────────────────
            Project p1 = project(projectRepo, "Website Redesign", surya, List.of(alice, bob, diana));

            Task t1  = task(taskRepo, "Design new homepage mockup",
                    "Create high-fidelity Figma mockups for the redesigned homepage. Include hero section, feature highlights, and CTA blocks.",
                    "HIGH", p1, alice, true);
            Task t2  = task(taskRepo, "Build responsive navigation",
                    "Implement sticky top navigation using vanilla CSS. Must work on mobile, tablet, and desktop breakpoints.",
                    "HIGH", p1, bob, false);
            Task t3  = task(taskRepo, "Write landing page copy",
                    "Draft compelling copy for all homepage sections. Tone should be professional and approachable.",
                    "MEDIUM", p1, diana, false);
            Task t4  = task(taskRepo, "Set up CI/CD pipeline",
                    "Configure GitHub Actions to automate build, test, and deploy on every merge to main.",
                    "CRITICAL", p1, surya, true);
            Task t5  = task(taskRepo, "Implement dark mode toggle",
                    "Add a CSS-variable-based dark mode. Store preference in localStorage.",
                    "MEDIUM", p1, bob, false);
            Task t6  = task(taskRepo, "Optimise image assets",
                    "Compress all images to WebP, add lazy loading, and add proper alt attributes.",
                    "LOW", p1, alice, false);

            // ── Project 2: Mobile App MVP (Alice owns) ─────────────────────────────
            Project p2 = project(projectRepo, "Mobile App MVP", alice, List.of(surya, evan, fiona));

            Task t7  = task(taskRepo, "Set up React Native project",
                    "Bootstrap the project with Expo, configure navigation, and set up ESLint + Prettier.",
                    "HIGH", p2, surya, true);
            Task t8  = task(taskRepo, "Design login & signup screens",
                    "Create pixel-perfect login/signup screens matching the design system. Include error state designs.",
                    "HIGH", p2, fiona, false);
            Task t9  = task(taskRepo, "Integrate REST API layer",
                    "Set up Axios, JWT interceptors, and a centralised API service module.",
                    "CRITICAL", p2, surya, false);
            Task t10 = task(taskRepo, "Build home feed component",
                    "Flat list with pull-to-refresh and infinite scroll. Must handle empty and error states.",
                    "MEDIUM", p2, evan, false);
            Task t11 = task(taskRepo, "Push notification setup",
                    "Integrate Expo push notifications. Handle foreground, background, and killed app states.",
                    "MEDIUM", p2, evan, true);
            Task t12 = task(taskRepo, "Write unit tests for auth flow",
                    "Use Jest to cover login, signup, token refresh, and logout edge cases.",
                    "LOW", p2, fiona, false);

            // ── Project 3: Internal Dashboard (Bob owns) ───────────────────────────
            Project p3 = project(projectRepo, "Internal Analytics Dashboard", bob, List.of(alice, diana, fiona));

            Task t13 = task(taskRepo, "Create charts component library",
                    "Build reusable chart components (line, bar, pie) using Chart.js. Export as a shared module.",
                    "HIGH", p3, alice, false);
            Task t14 = task(taskRepo, "Connect to analytics API",
                    "Fetch event data from PostHog and normalise into internal data structures.",
                    "CRITICAL", p3, bob, true);
            Task t15 = task(taskRepo, "Implement date range picker",
                    "Build a reusable date range selector with presets (Today, 7d, 30d, Custom).",
                    "MEDIUM", p3, diana, false);
            Task t16 = task(taskRepo, "Write user documentation",
                    "Document all dashboard features, filters, and export options in Confluence.",
                    "LOW", p3, fiona, false);
            Task t17 = task(taskRepo, "Export to CSV/PDF feature",
                    "Allow users to export filtered data as CSV or a formatted PDF report.",
                    "MEDIUM", p3, alice, false);
            Task t18 = task(taskRepo, "Add role-based access control",
                    "Admins see all metrics; Editors can create reports; Viewers are read-only.",
                    "HIGH", p3, bob, true);

            // ── Project 4: API Gateway (Diana owns) ───────────────────────────────
            Project p4 = project(projectRepo, "API Gateway Refactor", diana, List.of(surya, evan, bob));

            Task t19 = task(taskRepo, "Design OpenAPI 3.0 spec",
                    "Document all 40+ endpoints with request/response schemas, error codes, and examples.",
                    "HIGH", p4, diana, true);
            Task t20 = task(taskRepo, "Migrate auth to OAuth 2.0",
                    "Replace legacy API key auth with OAuth 2.0 + PKCE. Support Google and GitHub providers.",
                    "CRITICAL", p4, surya, false);
            Task t21 = task(taskRepo, "Add rate limiting middleware",
                    "Implement token-bucket rate limiting per user/IP. Return 429 with Retry-After header.",
                    "HIGH", p4, evan, false);
            Task t22 = task(taskRepo, "Write integration tests",
                    "Cover all happy paths and critical error paths using RestAssured.",
                    "MEDIUM", p4, bob, false);
            Task t23 = task(taskRepo, "Set up API monitoring",
                    "Integrate Datadog APM. Create dashboards for p50/p95/p99 latency and error rates.",
                    "MEDIUM", p4, evan, true);

            // ── Project 5: Data Pipeline (Evan owns) ──────────────────────────────
            Project p5 = project(projectRepo, "Data Pipeline v2", evan, List.of(diana, fiona, surya));

            Task t24 = task(taskRepo, "Design ETL architecture",
                    "Create architecture diagram for the new event-driven pipeline using Kafka + Spark.",
                    "CRITICAL", p5, evan, true);
            Task t25 = task(taskRepo, "Implement data ingestion layer",
                    "Build Kafka consumers for 12 event types. Include dead-letter queue handling.",
                    "HIGH", p5, surya, false);
            Task t26 = task(taskRepo, "Build transformation jobs",
                    "Write Spark jobs to clean, enrich, and aggregate raw events into fact tables.",
                    "HIGH", p5, diana, false);
            Task t27 = task(taskRepo, "Set up data quality checks",
                    "Add Great Expectations validation suite. Fail the pipeline on schema drift.",
                    "MEDIUM", p5, fiona, false);
            Task t28 = task(taskRepo, "Create data catalog",
                    "Document all datasets, schemas, and lineage in Apache Atlas.",
                    "LOW", p5, fiona, true);

            // ── Project 6: Design System (Fiona owns) ─────────────────────────────
            Project p6 = project(projectRepo, "Design System 2.0", fiona, List.of(alice, diana, bob));

            Task t29 = task(taskRepo, "Audit existing components",
                    "Review all 80+ existing components for accessibility, consistency, and deprecation.",
                    "HIGH", p6, fiona, true);
            Task t30 = task(taskRepo, "Build token system",
                    "Define color, typography, spacing, and shadow tokens in JSON. Generate CSS variables.",
                    "CRITICAL", p6, fiona, false);
            Task t31 = task(taskRepo, "Migrate Button variants",
                    "Redesign all 6 button variants (primary, secondary, ghost, danger, icon, loading) using new tokens.",
                    "HIGH", p6, alice, false);
            Task t32 = task(taskRepo, "Write Storybook stories",
                    "Cover all component states and variants with interactive controls and a11y addon.",
                    "MEDIUM", p6, diana, false);
            Task t33 = task(taskRepo, "Publish NPM package",
                    "Set up semantic-release, generate TypeScript types, and publish @projectboard/ui to NPM.",
                    "HIGH", p6, bob, false);

            // ── Comments ───────────────────────────────────────────────────────────
            comment(commentRepo, t1, alice,  "Mockup shared in Figma — please review the hero section colours.");
            comment(commentRepo, t1, surya,  "Colours look great. Can we try a slightly lighter shade for the CTA?");
            comment(commentRepo, t2, bob,    "Running into a flexbox issue on iOS Safari. Will investigate.");
            comment(commentRepo, t2, diana,  "I had the same issue — setting overflow:hidden on the parent fixed it.");
            comment(commentRepo, t4, surya,  "Pipeline deployed. All tests passing on main.");
            comment(commentRepo, t9, surya,  "Axios interceptors done. Need backend CORS headers updated for OPTIONS.");
            comment(commentRepo, t9, alice,  "CORS config updated — try again.");
            comment(commentRepo, t14, bob,   "PostHog integration complete. Data flowing into the warehouse.");
            comment(commentRepo, t19, diana, "OpenAPI spec drafted. Ready for review by the team.");
            comment(commentRepo, t20, surya, "Blocked on the Google OAuth callback URL approval — ETA 2 days.");
            comment(commentRepo, t24, evan,  "Architecture approved by CTO. Starting implementation.");
            comment(commentRepo, t29, fiona, "Found 23 components with accessibility issues. Raising tickets.");
            comment(commentRepo, t30, fiona, "Token names following Brad Frost's atomic naming convention.");
            comment(commentRepo, t30, alice, "Love the approach. Can we add motion tokens for animation durations?");

            System.out.println("✅ Seeded 6 users, 6 projects, 33 tasks, 14 comments");
        };
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private User save(UserRepository repo, PasswordEncoder enc, String name, String email, String pwd) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(enc.encode(pwd));
        return repo.save(u);
    }

    private Project project(ProjectRepository repo, String name, User owner, List<User> members) {
        Project p = new Project();
        p.setName(name);
        p.setOwnerId(owner.getId());
        p.setMemberIds(new ArrayList<>());
        p.getMemberIds().add(owner.getId());
        members.forEach(m -> p.getMemberIds().add(m.getId()));
        return repo.save(p);
    }

    private Task task(TasksRepository repo, String title, String description,
                      String priority, Project project, User assignedTo, boolean completed) {
        Task t = new Task();
        t.setTitle(title);
        t.setDescription(description);
        t.setPriority(priority);
        t.setProjectId(project.getId());
        t.setAssignedTo(assignedTo.getId());
        t.setCompleted(completed);
        return repo.save(t);
    }

    private void comment(CommentRepository repo, Task task, User author, String content) {
        Comment c = new Comment();
        c.setTaskId(task.getId());
        c.setAuthorId(author.getId());
        c.setContent(content);
        c.setCreatedAt(LocalDateTime.now().minusHours((long)(Math.random() * 48)));
        repo.save(c);
    }
}