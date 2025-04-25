# CI/CD Pipeline for Contest Tracker

This document describes the CI/CD pipeline setup for the Contest Tracker application using Jenkins.

## Pipeline Overview

The pipeline consists of the following stages:
1. Clone GitHub repo
2. Install dependencies and run tests for both frontend and backend
3. Build a Docker image using a multi-stage Dockerfile
4. Push the image to Docker Hub
5. Deploy the container locally or to a server

## Prerequisites

Before using this pipeline, ensure you have:

- Jenkins installed and running
- Docker installed on the Jenkins agent
- A multi-stage Dockerfile for the application
- Jenkins credentials added:
  - For Docker Hub (ID: `dockerhub-creds`)
  - For YouTube API key (ID: `youtube-api-key`)
- MongoDB instance (local, Docker, or cloud like Atlas)

## Project Structure

The project follows a typical MERN app structure:

```
contest-tracker/
├── frontend/          # React app
├── backend/           # Express API
├── Dockerfile         # Main multi-stage Dockerfile
├── docker-compose.yml # For local development with MongoDB
├── Jenkinsfile        # CI/CD pipeline definition
└── docker-test.sh     # Helper script for local testing
```

## Docker Setup

### Main Dockerfile

The main Dockerfile in the root directory uses a multi-stage build:
- Stage 1: Build the React frontend
- Stage 2: Build the backend and include the frontend build files in the public directory

### Docker Compose

For local development, a `docker-compose.yml` file is provided to run the application with MongoDB.

## Jenkins Pipeline

The Jenkinsfile defines the CI/CD pipeline with the following stages:

1. **Checkout Code**: Clone the repository
2. **Install & Test**: Install dependencies and run tests for both frontend and backend
3. **Build Docker Image**: Build a Docker image using the multi-stage Dockerfile
4. **Push Docker Image**: Tag and push the image to Docker Hub
5. **Deploy Locally**: Deploy the container locally with all required environment variables

## Testing Locally

To test the Docker setup locally:

```bash
# Using the provided script
chmod +x docker-test.sh
./docker-test.sh

# Or using Docker Compose
docker-compose up -d
```

Access the application at http://localhost:3030

## Customization

To use this pipeline for your own project:
1. Update the `IMAGE` environment variable in the Jenkinsfile with your Docker Hub username
2. Set up the required Jenkins credentials:
   - `dockerhub-creds` for Docker Hub
   - `youtube-api-key` for YouTube API
3. Modify the MongoDB connection string if needed
4. Adjust environment variables in the Jenkinsfile and docker-compose.yml to match your specific requirements 