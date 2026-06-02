# ==========================================
# Stage 1: Build & Compilation Engine
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install packages (including devDependencies needed for build)
RUN npm install

# Copy all frontend source files
COPY . .

# 🚀 FIX 1: Inject the backend API URL dynamically during the build process
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the optimized Next.js production bundle
RUN npm run build

# ==========================================
# Stage 2: Minimal Production Runtime
# ==========================================
FROM node:18-alpine

WORKDIR /app

# Ensure we run strictly in production mode
ENV NODE_ENV=production

# Copy node modules and built app from builder stage cleanly
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3000

# 🚀 FIX 2: Correct the health check script to return an explicit exit code 
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => { if (r.statusCode !== 200) process.exit(1); })"

# Start Next.js production server
CMD ["npm", "start"]