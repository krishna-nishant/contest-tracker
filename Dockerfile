# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend with Frontend included
FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

# Create the public directory if it doesn't exist
RUN mkdir -p ./public

# Copy the frontend build to the backend's public directory
COPY --from=frontend-builder /app/frontend/dist/ ./public/

# Expose the port the app runs on
EXPOSE 5000

# Start the server
CMD ["node", "server.js"] 