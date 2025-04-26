#!/bin/bash

# Script to start both the frontend and ML service for MediBox

echo "=== MediBox Application Startup ==="
echo ""

# Check if screen is installed
if ! command -v screen &> /dev/null; then
    echo "Screen is not installed. Please install it with:"
    echo "sudo apt install screen"
    exit 1
fi

# Start ML Service
echo "Starting ML service..."
cd ml/src
screen -dmS ml python main.py
echo "ML service started in screen session 'ml'"
echo "Connect to it with: screen -r ml"
echo ""

# Go back to root directory
cd ../../

# Start frontend
echo "Starting Next.js frontend..."
cd frontend
screen -dmS frontend npm run dev
echo "Frontend started in screen session 'frontend'"
echo "Connect to it with: screen -r frontend"
echo ""

# Go back to root directory
cd ../../

# Start backend
echo "Starting backend service..."
cd backend
screen -dmS backend npm run dev
echo "Backend started in screen session 'backend'"
echo "Connect to it with: screen -r backend"
echo ""


echo "Both services are running!"
echo "- Frontend: http://localhost:3000"
echo "- ML API: http://localhost:5001"
echo "- Backend: http://localhost:5000"
echo "To stop the services, use: screen -X -S ml quit && screen -X -S frontend quit && screen -X -S backend quit" 