# Backend stage
# Use the official Python image as the base image for backend
FROM python:3.11.5-slim as backend

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    libgl1-mesa-glx \
    libglib2.0-0

# Copy requirements and install dependencies
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m pip install -r requirements.txt

# Switch to non-privileged user
USER appuser

# Copy source code
COPY ./sam-test .

# Frontend stage
# Use the official Alpine image as the base image for frontend
FROM alpine:latest as frontend

# Create a non-privileged user for frontend
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Create a directory for the frontend app
WORKDIR /frontend

# Copy frontend files
COPY ./my-app .

# Final stage
# Use a minimal image for the final stage
FROM alpine:latest

# Create a non-privileged user for the final stage
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Copy backend files
COPY --from=backend /app /app

# Copy frontend files
COPY --from=frontend /frontend /frontend

# Switch to non-privileged user
USER appuser

# Expose the port that the application listens on (adjust as needed)
EXPOSE 8000

# Run the backend application
CMD python /app/server.py
