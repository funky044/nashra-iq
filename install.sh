#!/bin/bash

# NashraIQ One-Click Installation Script
# This script sets up the entire platform with a single command

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║              🚀 NashraIQ Platform Installer                ║"
echo "║          Financial Intelligence Platform Setup             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✓ Docker detected"
echo "✓ Docker Compose detected"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file to add your API keys before running in production!"
    echo ""
fi

echo "════════════════════════════════════════════════════════════"
echo "Starting NashraIQ Platform..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers (if any)..."
docker-compose down 2>/dev/null || true
echo ""

# Pull images
echo "📥 Pulling Docker images..."
docker-compose pull
echo ""

# Build containers
echo "🔨 Building application containers..."
docker-compose build
echo ""

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."
docker-compose ps

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✨ Installation Complete!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Your NashraIQ platform is now running at:"
echo ""
echo "   👉 http://localhost:3000"
echo ""
echo "📋 Demo Credentials:"
echo "   User:  demo@nashra-iq.com / demo123"
echo "   Admin: admin@nashra-iq.com / admin123"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs:      docker-compose logs -f"
echo "   Stop platform:  docker-compose stop"
echo "   Restart:        docker-compose restart"
echo "   Full reset:     docker-compose down -v"
echo ""
echo "📚 Next Steps:"
echo "   1. Visit http://localhost:3000"
echo "   2. Edit .env to add your licensed API keys"
echo "   3. Restart with: docker-compose restart"
echo ""
echo "════════════════════════════════════════════════════════════"
