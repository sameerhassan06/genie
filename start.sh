#!/bin/bash

# Start script for production deployment
echo "Starting Multi-Tenant SaaS Platform..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

if [ -z "$SESSION_SECRET" ]; then
    echo "ERROR: SESSION_SECRET environment variable is not set"
    exit 1
fi

echo "Environment variables validated successfully"
echo "Starting server on port ${PORT:-5000}..."

# Start the Node.js application
exec node dist/index.js