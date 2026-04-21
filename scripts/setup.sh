#!/bin/bash

echo "Setting up Halo Health development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "Node.js version: $(node -v)"

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Create logs directory
mkdir -p logs

# Create uploads directory
mkdir -p uploads

cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install

# Create assets directories
mkdir -p assets/images
mkdir -p assets/icons
mkdir -p assets/sounds
mkdir -p assets/fonts

cd ..

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend .env file..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "Please create backend/.env file manually"
fi

if [ ! -f frontend/.env ]; then
    echo "Creating frontend .env file..."
    cp frontend/.env.example frontend/.env 2>/dev/null || echo "Please create frontend/.env file manually"
fi

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables in backend/.env and frontend/.env"
echo "2. Set up your Supabase project"
echo "3. Run 'npm run dev' in the backend directory"
echo "4. Run 'npm start' in the frontend directory"
echo ""
echo "For detailed setup instructions, see the documentation in the docs/ directory."
