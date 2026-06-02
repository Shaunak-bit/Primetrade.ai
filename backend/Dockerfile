# ==========================================
# Stage 1: Build & Dependency Installation
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install ALL dependencies (including devDependencies if needed for build steps)
RUN npm install

# Copy all backend source code
COPY . .

# ==========================================
# Stage 2: Minimal Production Runtime
# ==========================================
FROM node:18-alpine

WORKDIR /app

# 🚀 FIX: Copy everything cleanly from the builder stage into the current working directory
COPY --from=builder /app ./

# Expose your Express server port
EXPOSE 5000

# Defensive Health Check matching your Express app.js configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => { if (r.statusCode !== 200) process.exit(1); })"

# Start the application using your production manifest script
CMD ["npm", "start"]