#!/bin/bash

# Counter Tracker Network Helper
# Shows how to access the app from your network

echo "🌐 Counter Tracker - Network Access Information"
echo "=============================================="
echo ""

# Get Raspberry Pi IP
PI_IP=$(hostname -I | awk '{print $1}')
HOSTNAME=$(hostname)

if [ -z "$PI_IP" ]; then
    echo "❌ Could not determine IP address"
    echo "Make sure you're connected to WiFi/Ethernet"
    exit 1
fi

echo "✅ Raspberry Pi IP: $PI_IP"
echo "✅ Hostname: $HOSTNAME"
echo ""

echo "📱 Access the app from any device on your network:"
echo ""
echo "Using IP address:"
echo "  http://$PI_IP:8000"
echo ""
echo "Using hostname (recommended):"
echo "  http://$HOSTNAME.local:8000"
echo ""

echo "🔍 To find the IP from another device:"
echo ""
echo "On Mac/Linux:"
echo "  ping $HOSTNAME.local"
echo "  arp-scan -l | grep -i raspberry"
echo ""
echo "On Windows (PowerShell):"
echo "  ping $HOSTNAME"
echo "  arp -a"
echo ""

echo "⚡ Quick Links:"
echo "  API Health: http://$PI_IP:8000/health"
echo "  API Docs: http://$PI_IP:8000/docs"
echo ""

echo "🔐 Login credentials are in: backend/.env"
echo ""

# Check if app is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running"
    echo "Start it with: ./start.sh"
fi
