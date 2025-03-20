#!/bin/bash

# Install Railway CLI if not already installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm i -g @railway/cli
fi

# Login to Railway (opens browser for authentication)
echo "Logging in to Railway..."
railway login

# Create a new project or link to existing one
if [ "$1" == "new" ]; then
    echo "Creating new Railway project..."
    railway init
else
    echo "Linking to existing Railway project..."
    railway link
fi

# Deploy to Railway
echo "Deploying to Railway..."
railway up

echo "Deployment complete! You can view your project at https://railway.app/dashboard" 