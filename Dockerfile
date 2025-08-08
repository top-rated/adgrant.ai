# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p exports && \
    mkdir -p logs && \
    mkdir -p data && \
    chmod -R 755 exports logs data && \
    chown -R nodejs:nodejs /app

# Create init script to fix volume permissions at runtime
RUN printf '#!/bin/sh\n\
# Fix permissions for mounted volumes\n\
mkdir -p /app/data /app/exports /app/logs\n\
chmod -R 777 /app/data /app/exports /app/logs\n\
# Create empty leads.json if it does not exist\n\
if [ ! -f /app/data/leads.json ]; then\n\
  echo "[]" > /app/data/leads.json\n\
  chmod 666 /app/data/leads.json\n\
fi\n\
# Switch to nodejs user and start the main application\n\
exec su-exec nodejs "$@"\n' > /app/init.sh && \
chmod +x /app/init.sh

# Install su-exec for user switching in init script
RUN apk add --no-cache su-exec

# Create health check script
RUN echo '#!/bin/sh\ncurl -f http://localhost:${PORT:-3000}/health || exit 1' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh

# Expose port (default 3000, configurable via environment)
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /app/healthcheck.sh

# Use init script as entrypoint to handle permissions, then start app
ENTRYPOINT ["/app/init.sh"]
CMD ["node", "src/index.js"]
