# ══════════════════════════════════════════════════════════════════════════════
# Stage 1 – Build
# ══════════════════════════════════════════════════════════════════════════════
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Pre-download dependencies (layer-cached unless pom.xml changes)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build the fat JAR
COPY src ./src
RUN mvn package -DskipTests -q

# ══════════════════════════════════════════════════════════════════════════════
# Stage 2 – Runtime (minimal JRE only)
# ══════════════════════════════════════════════════════════════════════════════
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
