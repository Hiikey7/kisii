# E-County System Startup Script
Write-Host "=== E-COUNTY SYSTEM STARTUP ===" -ForegroundColor Cyan
Write-Host "Starting services..." -ForegroundColor Yellow

# Change to backend directory
Write-Host "`nStarting Backend Server..." -ForegroundColor Yellow
Push-Location "c:\Users\Mkenya045\Desktop\E COUNTY PROJECT\E-COUNTY SYSTEM\backend"
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "src/server.js" -PassThru | Out-Null
Write-Host "✓ Backend started on http://localhost:5000" -ForegroundColor Green

# Wait for backend to initialize
Start-Sleep -Seconds 3

# Change to frontend directory
Write-Host "`nStarting Frontend Server..." -ForegroundColor Yellow
Pop-Location
Push-Location "c:\Users\Mkenya045\Desktop\E COUNTY PROJECT\E-COUNTY SYSTEM\frontend"
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "serve.js" -PassThru | Out-Null
Write-Host "✓ Frontend started on http://localhost:3000" -ForegroundColor Green

Pop-Location

Write-Host "`n=== E-COUNTY SYSTEM RUNNING ===" -ForegroundColor Cyan
Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Green
Write-Host "Backend:   http://localhost:5000" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to stop (this will only close this window)" -ForegroundColor Yellow
