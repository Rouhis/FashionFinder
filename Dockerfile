# Use node image for base image for all stages.
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app/my-app

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser || true

RUN adduser appuser || true
# Set working directory for all build stages.
################################################################################
# Create a stage for installing production dependencies.
FROM base as deps
# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.yarn to speed up subsequent builds.
# Leverage bind mounts to package.json and yarn.lock to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=my-app/package.json,target=package.json \
    --mount=type=bind,source=my-app/yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile

################################################################################
# Create a stage for building the application.
FROM deps as build
# Download additional development dependencies before building, as some projects require
# "devDependencies" to be installed to build. If you don't need this, remove this step.
RUN --mount=type=bind,source=my-app/package.json,target=package.json \
    --mount=type=bind,source=my-app/yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

COPY my-app .

# Run the build script.
VOLUME /shared

COPY my-app/src/assets/data/ shared
# Copy the rest of the source files into the image.
RUN yarn run build

################################################################################
# Create a new stage to run the application with Fminimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as node-final
# Use production node environment by default.
ENV NODE_ENV production

# Copy package.json so that package manager commands can be used.
COPY my-app/package.json .
# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=deps /usr/src/app/my-app/node_modules ./node_modules
COPY --from=build /usr/src/app/my-app/ ./

# Expose the port that the application listens on.
EXPOSE 8080

# Run the application.
CMD yarn start

FROM node-final as node-shared

# Arguments for Python version and UID
ARG PYTHON_VERSION=3.11.5
ARG UID=10001
# Use python image for base image for all stages.
FROM python:3.11.5-slim as python-base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1
# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

WORKDIR /usr/src/app/server

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/go/dockerfile-user-best-practices/
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser || true

RUN adduser appuser || true
# Grant permissions to the home directory.
# Install necessary dependencies.
RUN apt-get update && apt-get install -y \
    git \
    libgl1-mesa-glx \
    libglib2.0-0
# Switch to the non-privileged user to run the application.



# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.cache/pip to speed up subsequent builds.
# Leverage a bind mount to requirements.txt to avoid having to copy them into
# into this layer.
FROM python-base as python-deps
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=/server/requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt

VOLUME /shared

# Copy the source code into the container.
COPY server .

# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.
CMD python server.py

# Add these lines at the end of your Dockerfile

# Python stage
FROM python-final