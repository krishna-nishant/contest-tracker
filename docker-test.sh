#!/bin/bash

# Simple script to test Docker setup locally

echo "Building Docker image..."
docker build -t contest-tracker:test .

echo "Stopping and removing any existing container..."
docker stop contest-tracker || true
docker rm contest-tracker || true

echo "Running new container..."
docker run -d -p 3030:5000 -e PORT=5000 -e YOUTUBE_API_KEY=AIzaSyBZfsfaWiyHbi9jX-c3A2HbiwZk5d5Gu2E -e MONGO_URI=mongodb://host.docker.internal:27017/contest-tracker --name contest-tracker contest-tracker:test

echo "Container is now running on http://localhost:3030"
echo "To check logs: docker logs contest-tracker"
echo "To stop: docker stop contest-tracker" 