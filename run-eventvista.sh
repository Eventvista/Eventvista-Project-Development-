#!/bin/bash

# Terminate the script immediately if any individual command fails
set -e

echo "==================================================="
echo "  1. RESETTING NETWORK PORTS & KILLING GHOST PIDs  "
echo "==================================================="

# Automatically kill any hidden background processes holding port 3000 or 5000
# This guarantees Next.js will never throw a port/collision crash.
echo "Clearing Port 3000 (Frontend Next.js)..."
fuser -k 3000/tcp 2>/dev/null || true

echo "Clearing Port 5000 (Backend Express)..."
fuser -k 5000/tcp 2>/dev/null || true

echo "Ports cleared successfully."
echo ""

echo "==================================================="
echo "  2. SPINNING UP EVENTVISTA FULL-STACK SYSTEM      "
echo "==================================================="

# Capture the absolute path of the project root
ROOT_DIR=$(pwd)

# Step A: Enter the backend folder, install missing modules, and start it in the background
echo "-> Starting API Engine (Backend)..."
cd "$ROOT_DIR/backend"
npm install --silent
npm run dev &
BACKEND_PID=$! # Save the process ID of the backend to clean it up later

# Step B: Enter the frontend folder and execute your combined test:desktop script
echo "-> Running Frontend Dev Server & Spawning Electron App..."
cd "$ROOT_DIR/frontend"
npm install --silent

# Run your package.json concurrent script natively
npm run test:desktop

echo "==================================================="
echo "  3. SYSTEM TEARDOWN & CLEANUP                     "
echo "==================================================="

# Once you close the Electron application window, gracefully stop the background backend API
echo "Closing desktop window. Safely shutting down backend process (PID: $BACKEND_PID)..."
kill $BACKEND_PID 2>/dev/null || true

echo "All systems stopped cleanly. Terminal ready."
