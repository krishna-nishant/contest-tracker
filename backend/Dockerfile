# Use multi-stage build to reduce image size
FROM node:18-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci  # Use npm ci for faster and more reliable builds

COPY . .  

# Expose the port your backend runs on
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
