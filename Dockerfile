# Stage 1: Build the frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/Frontend
# Copy frontend package files and install dependencies
COPY Frontend/package*.json ./
RUN npm install

# Copy frontend source code and build it
COPY Frontend ./
RUN npm run build
# (This assumes the build script in Frontend/package.json outputs to ../Backend/dist
# If it outputs there, we'll extract it from /app/Backend/dist, but wait, the build script
# says: "vite build --outDir ../Backend/dist --emptyOutDir"
# So we need the Backend folder to exist during the frontend build)

# Actually, let's just do everything from the root
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/Frontend
RUN npm install
RUN npm run build

# Stage 2: Setup the backend and serve the app
FROM node:22-alpine

WORKDIR /app/Backend
# Copy backend package files and install production dependencies
COPY Backend/package*.json ./
RUN npm install --production

# Copy backend source code
COPY Backend ./

# Copy the built frontend from the previous stage
COPY --from=frontend-builder /app/Backend/dist ./dist

# Expose the port the backend runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
