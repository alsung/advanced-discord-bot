# # Stage 1: Build
# FROM node:18-alpine AS builder

# # Set the working directory
# WORKDIR /app

# # Copy package files and install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy the rest of the application
# COPY . .

# # Build the application
# RUN npm run build

# # Stage 2: Production Image
# FROM node:18-alpine

# # Set the working directory
# WORKDIR /app

# # Copy from the build stage
# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/package*.json ./

# # Install production dependencies only
# RUN npm install --only=production

# # Expose the port your bot listens on
# EXPOSE 3000

# # Start the bot
# CMD ["node", "dist/index.js"]

# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application
COPY . .

# Build TypeScript files
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
