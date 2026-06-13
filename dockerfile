# ── Stage 1: Build frontend ────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /static

COPY static/package*.json ./
RUN npm ci

COPY static/ .
RUN npm run build && \
    cp sample.jpg dist/sample.jpg && \
    cp src/logo.jpeg dist/logo.jpeg

# ── Stage 2: Python backend ────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app/ ./app/
COPY . .

# Copy built frontend from stage 1
COPY --from=frontend-build /static/dist ./static/dist

# Expose port
EXPOSE 8000

# Start server
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]