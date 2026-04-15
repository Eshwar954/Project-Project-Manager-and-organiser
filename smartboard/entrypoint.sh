#!/bin/sh
# entrypoint.sh – no longer needed (H2 in-memory, no external DB).
# The Dockerfile calls java -jar directly; this file is kept for reference only.
exec java \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -Djava.security.egd=file:/dev/./urandom \
  -jar /app/app.jar
