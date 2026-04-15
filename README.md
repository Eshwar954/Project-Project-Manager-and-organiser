# Smart Project Board

A full-stack project management application built with **React** (frontend) and **Spring Boot** (backend), featuring JWT authentication, role-based access control, and team collaboration.

Design Documentation : https://docs.google.com/document/d/1oftKAXZL49T09TRKfee-uMe2cgbGBK-8Vnh8a3_RLAQ/edit?usp=sharing
---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, native fetch |
| Backend | Spring Boot 4, Spring Security, Spring Data JPA |
| Auth | JWT (JJWT 0.11.5), BCrypt |
| Database | H2 (in-memory, dev) |
| Build | Maven, Vite |

---

## Features

- JWT-based authentication (signup / login)
- Create and manage projects
- Add members to projects
- Create and assign tasks to members
- Mark tasks as complete
- Project progress tracking (%)
- Role-based UI — ADMIN (owner) vs MEMBER views

---

## Project Structure

```
smartboard/
├── backend/                          # Spring Boot
│   └── src/main/java/com/smartboard/smartboard/
│       ├── config/
│       │   ├── SecurityConfig.java   # JWT filter chain, CORS
│       │   └── DataSeeder.java       # Seeds users, projects, tasks on startup
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── ProjectController.java
│       │   └── TaskController.java
│       ├── dto/
│       │   ├── AuthRequest.java
│       │   ├── AuthResponse.java
│       │   └── TaskRequest.java
│       ├── entity/
│       │   ├── User.java
│       │   ├── Project.java
│       │   └── Task.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── ProjectRepository.java
│       │   └── TasksRepository.java
│       ├── security/
│       │   ├── JwtUtil.java
│       │   ├── JwtAuthFilter.java
│       │   └── UserDetailsServiceImpl.java
│       └── services/
│           ├── AuthService.java
│           ├── ProjectService.java
│           └── TaskService.java
│
└── frontend/                         # React + Vite
    └── src/
        ├── api/
        │   └── api.js                # fetch wrapper, JWT injection
        ├── context/
        │   └── AuthContext.jsx       # global auth state
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── DashboardPage.jsx
        │   └── ProjectPage.jsx
        └── routes/
            └── PrivateRoute.jsx
```

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Maven

---

### Backend Setup

```bash
cd smartboard
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

H2 console available at `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:smartboard`
- Username: `sa`
- Password: *(leave blank)*

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Seeded Accounts

The app seeds test data automatically on first startup.

| Name | Email | Password | Owns |
|------|-------|----------|------|
| Surya | surya@test.com | 123456 | Website Redesign |
| Alice | alice@test.com | 123456 | Mobile App MVP |
| Bob | bob@test.com | 123456 | Internal Dashboard |

> **Note:** H2 is in-memory — data resets on every backend restart. Log out and log back in after restarting the backend.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | None | Register new user |
| POST | `/api/auth/login` | None | Login, returns JWT |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | JWT | List user's projects |
| POST | `/api/projects` | JWT | Create project |
| POST | `/api/projects/{id}/members` | JWT (ADMIN) | Add member by email |
| GET | `/api/projects/{id}/members` | JWT | Get project members |
| GET | `/api/projects/{id}/progress` | JWT | Get task progress % |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects/{id}/tasks` | JWT | List tasks for project |
| POST | `/api/projects/{id}/tasks` | JWT (ADMIN) | Create task |
| PUT | `/api/tasks/{id}/complete` | JWT | Mark task complete |
| PUT | `/api/tasks/{id}/assign` | JWT (ADMIN) | Reassign task |

---

## Role System

Roles are derived at runtime — no role table in the database.

```
if (project.ownerId == currentUserId)  →  ADMIN
else                                   →  MEMBER
```

| Action | ADMIN | MEMBER |
|--------|-------|--------|
| View project | ✅ | ✅ |
| Add members | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| View all tasks | ✅ | ❌ |
| View own tasks | ✅ | ✅ |
| Mark task done | ✅ | ✅ |

---

## Environment Notes

### Backend — `application.properties`

```properties
spring.datasource.url=jdbc:h2:mem:smartboard
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true
server.port=8080
```

### Frontend — `api.js`

```js
const BASE_URL = 'http://localhost:8080/api';
```

Change `BASE_URL` when deploying to production.

---

## Common Issues

| Issue | Fix |
|-------|-----|
| 403 on all requests after restart | Log out and log back in — H2 resets user IDs |
| CORS error | Ensure `SecurityConfig` has `.cors(cors -> cors.configurationSource(...))` |
| Members dropdown empty | Restart backend, go to dashboard, click project fresh |
| `Project not found` error | URL has stale ID — navigate from dashboard |

---

## Switching to MySQL (Production)

Replace `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartboard
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
```

Add MySQL driver to `pom.xml`:

```xml
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <scope>runtime</scope>
</dependency>
```
