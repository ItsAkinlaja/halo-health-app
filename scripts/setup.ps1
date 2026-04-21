# Halo Health Setup Script for PowerShell

Write-Host "Setting up Halo Health development environment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check Node.js version
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 18) {
        Write-Host "Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install

# Create logs directory
New-Item -ItemType Directory -Path "logs" -Force | Out-Null

# Create uploads directory
New-Item -ItemType Directory -Path "uploads" -Force | Out-Null

Set-Location ..

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install

# Create assets directories
New-Item -ItemType Directory -Path "assets/images" -Force | Out-Null
New-Item -ItemType Directory -Path "assets/icons" -Force | Out-Null
New-Item -ItemType Directory -Path "assets/sounds" -Force | Out-Null
New-Item -ItemType Directory -Path "assets/fonts" -Force | Out-Null

Set-Location ..

# Create .env files if they don't exist
if (-not (Test-Path "backend/.env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    if (Test-Path "backend/.env.example") {
        Copy-Item "backend/.env.example" "backend/.env"
    } else {
        Write-Host "Please create backend/.env file manually" -ForegroundColor Yellow
    }
}

if (-not (Test-Path "frontend/.env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    if (Test-Path "frontend/.env.example") {
        Copy-Item "frontend/.env.example" "frontend/.env"
    } else {
        Write-Host "Please create frontend/.env file manually" -ForegroundColor Yellow
    }
}

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your environment variables in backend/.env and frontend/.env" -ForegroundColor White
Write-Host "2. Set up your Supabase project" -ForegroundColor White
Write-Host "3. Run 'npm run dev' in the backend directory" -ForegroundColor White
Write-Host "4. Run 'npm start' in the frontend directory" -ForegroundColor White
Write-Host ""
Write-Host "For detailed setup instructions, see the documentation in the docs/ directory." -ForegroundColor Cyan
