FROM node:20-slim

# Install dependencies for Python and SQLite
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    sqlite3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN python3 -m venv /app/venv \
    && /app/venv/bin/pip install --upgrade pip \
    && /app/venv/bin/pip install -r requirements.txt

# Update PATH to use the virtual environment
ENV PATH="/app/venv/bin:$PATH"

# Copy package.json and install Node dependencies 
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install

# Copy all app files
COPY gatherings.py models.py services.py ./
# Copy test files
COPY test_example.py ./

# Build the TypeScript application
RUN npm run build

# Set environment variables
ENV GATHERINGS_DB_PATH=/data/gatherings.db
ENV GATHERINGS_SCRIPT=/app/gatherings.py

# Create volume for data persistence
VOLUME /data

# Default command to run the MCP server
ENTRYPOINT ["node", "build/index.js"]

# Add metadata labels
LABEL org.opencontainers.image.title="Gatherings MCP Server"
LABEL org.opencontainers.image.description="A Model Context Protocol server for managing gatherings and expense sharing"
LABEL org.opencontainers.image.licenses="Apache-2.0"