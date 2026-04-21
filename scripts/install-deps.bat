@echo off
echo Installing missing dependencies for Halo Health...
echo.

cd frontend

echo Installing expo-image-picker...
call npm install expo-image-picker

echo Installing expo-av...
call npm install expo-av

echo.
echo Installation complete!
echo.
echo Please restart your development server:
echo   npm start -- --clear
echo.
pause
