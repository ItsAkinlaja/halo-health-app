#!/bin/bash

echo "Starting Halo Health development servers..."

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check if required ports are available
if ! check_port 3001; then
    echo "Backend port 3001 is in use. Please stop the existing process or use a different port."
    exit 1
fi

if ! check_port 19006; then
    echo "Frontend port 19006 is in use. Please stop the existing process or use a different port."
    exit 1
fi

# Start backend server
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "Development servers started!"
echo ""
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:19006"
echo "Health Check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap to cleanup on exit
trap cleanup INT TERM

# Wait for processes
wait
