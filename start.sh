#!/bin/bash

# Counter Tracker App - Production Startup Script
# Run this script on Raspberry Pi to start the application

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "🚀 Counter Tracker - Starting Application"
echo "📁 Project directory: $SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is already running
if [ -f "$BACKEND_DIR/.pid" ]; then
    OLD_PID=$(cat "$BACKEND_DIR/.pid")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Backend already running (PID: $OLD_PID)${NC}"
        echo "Stopping old process..."
        kill "$OLD_PID" 2>/dev/null || true
        sleep 1
    fi
fi

# Setup backend
echo -e "${GREEN}📦 Setting up backend...${NC}"
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Install dependencies
if [ -f "requirements.txt" ]; then
    pip install -q -r requirements.txt
fi

# Start backend
echo -e "${GREEN}🌍 Starting backend on port 8000...${NC}"
nohup python3 main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .pid

echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo "📝 Backend logs: $BACKEND_DIR/backend.log"

# Give backend time to start
sleep 2

# Test backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "Check logs: cat $BACKEND_DIR/backend.log"
    exit 1
fi

# Display network access info
echo ""
echo -e "${GREEN}🎉 Application Ready!${NC}"
echo ""
echo "📱 Access from your network:"
PI_IP=$(hostname -I | awk '{print $1}')
echo -e "  ${YELLOW}http://$PI_IP:8000${NC}"
echo -e "  ${YELLOW}http://raspberrypi.local:8000${NC}"
echo ""
echo "🔐 Login with credentials from backend/.env"
echo ""
echo "To stop: kill $BACKEND_PID"
echo "To view logs: tail -f $BACKEND_DIR/backend.log"
echo ""
