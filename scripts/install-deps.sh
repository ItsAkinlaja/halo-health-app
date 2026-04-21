#!/bin/bash

echo "Installing missing dependencies for Halo Health..."

cd frontend

echo "Installing expo-image-picker..."
npm install expo-image-picker

echo "Installing expo-av..."
npm install expo-av

echo "Installation complete!"
echo ""
echo "Please restart your development server:"
echo "  npm start -- --clear"
