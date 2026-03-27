#!/bin/bash
# Craving Duel — startup script for Raspberry Pi
# Starts the FastAPI backend. Run once after cloning and setting up .env

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Starting Craving Duel..."

# Stop any running instance
if [ -f "$BACKEND_DIR/.pid" ]; then
    OLD_PID=$(cat "$BACKEND_DIR/.pid")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "Stopping existing process (PID: $OLD_PID)..."
        kill "$OLD_PID" 2>/dev/null || true
        sleep 1
    fi
    rm -f "$BACKEND_DIR/.pid"
fi

# Python virtual environment
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

# Auto-generate TLS certificates if they don't exist.
# This enables HTTPS which is required for full PWA support
# (push notifications, service worker on non-localhost).
if [ ! -f "$BACKEND_DIR/cert.pem" ] || [ ! -f "$BACKEND_DIR/key.pem" ]; then
    echo "Generating self-signed TLS certificate..."
    openssl req -x509 -newkey rsa:4096 -nodes \
        -out "$BACKEND_DIR/cert.pem" \
        -keyout "$BACKEND_DIR/key.pem" \
        -days 365 \
        -subj "/CN=raspberrypi.local" \
        -addext "subjectAltName=DNS:raspberrypi.local,DNS:localhost,IP:127.0.0.1" \
        2>/dev/null
    echo -e "${GREEN}Certificate generated (valid 365 days)${NC}"
else
    echo "Using existing TLS certificate"
fi

# Start backend
echo "Starting backend on port 8000..."
nohup python3 main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .pid

sleep 2

# Health check
if curl -s --insecure https://localhost:8000/api/health > /dev/null 2>&1; then
    PROTOCOL="https"
elif curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    PROTOCOL="http"
else
    echo -e "${RED}Backend failed to start. Check: cat $BACKEND_DIR/backend.log${NC}"
    exit 1
fi

PI_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "YOUR_IP")

echo ""
echo -e "${GREEN}Ready.${NC}"
echo ""
echo "  $PROTOCOL://$PI_IP:8000"
echo "  $PROTOCOL://raspberrypi.local:8000"
echo ""

if [ "$PROTOCOL" = "https" ]; then
    echo -e "${YELLOW}Note: Browser will warn about the self-signed certificate.${NC}"
    echo "  Tap 'Advanced -> Proceed' once to accept it."
    echo ""
fi

echo "  Credentials: see backend/.env"
echo "  Logs:        tail -f $BACKEND_DIR/backend.log"
echo "  Stop:        kill $BACKEND_PID"
echo ""
