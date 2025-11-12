FROM node:20-alpine AS builder
WORKDIR /app

# build frontend
COPY frontend/package.json frontend/package-lock.json* ./frontend/
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps || true
COPY frontend/ ./
RUN npm run build --silent

FROM node:20-alpine
WORKDIR /app
COPY backend/package.json ./backend/
WORKDIR /app/backend
RUN npm install --production --legacy-peer-deps || true
COPY backend/ ./backend/

# copy frontend build into backend static folder
COPY --from=builder /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "server.js"]
