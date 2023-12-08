# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG PYTHON_VERSION=3.11.5
FROM python:${PYTHON_VERSION}-slim as base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

FROM continuumio/miniconda3

WORKDIR /app

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#user
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/home/appuser" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser

# Grant permissions to the home directory.
RUN chown appuser:appuser /home/appuser

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.cache/pip to speed up subsequent builds.
# Leverage a bind mount to requirements.txt to avoid having to copy them into
# into this layer.

#System dependencies
RUN apt-get update && apt-get install -y \
    git \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    net-tools \
    sudo

COPY requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt

# Install Anaconda if /opt/conda directory doesn't exist
RUN if [ ! -d "/opt/conda" ]; then \
        wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda.sh && \
        bash miniconda.sh -b -p /opt/conda && \
        rm miniconda.sh && \
        echo "export PATH=/opt/conda/bin:$PATH" >> ~/.bashrc; \
    fi


# Anaconda installation
#RUN curl -O https://repo.anaconda.com/archive/Anaconda3-2023.09-0-Linux-x86_64.sh
#RUN bash Anaconda3-2023.09-0-Linux-x86_64.sh -b

# Ananconda packages for SAM
#RUN conda install pytorch==2.0.1 -y
#RUN conda install torchvision==0.15.2 -y
#RUN conda install torchaudio -y
#RUN conda install pytorch-cuda=11.8 -c pytorch -c nvidia -y
# Switch to the non-privileged user to run the application.
#USER appuser

# Copy the source code into the container.
COPY . .

# Expose the port that the application listens on.
EXPOSE 8080

# Run the application.
CMD python server.py --device cuda:0
