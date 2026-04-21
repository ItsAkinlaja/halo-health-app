# Halo Health Development Servers Script for PowerShell

Write-Host "Starting Halo Health development servers..." -ForegroundColor Green

# Function to check if port is in use
function Test-Port {
    param($Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Check if required ports are available
if (Test-Port -Port 3001) {
    Write-Host "Backend port 3001 is in use. Please stop the existing process or use a different port." -ForegroundColor Red
    exit 1
}

if (Test-Port -Port 19006) {
    Write-Host "Frontend port 19006 is in use. Please stop the existing process or use a different port." -ForegroundColor Red
    exit 1
}

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
Set-Location backend
$backendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru
Set-Location ..

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Set-Location frontend
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru
Set-Location ..

Write-Host "Development servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:19006" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow

# Function to cleanup processes
function Stop-Servers {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    exit 0
}

# Set up trap to cleanup on exit
try {
    # Wait for user to stop
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Stop-Servers
}
