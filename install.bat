@echo off
REM NashraIQ One-Click Installation Script for Windows

echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║              🚀 NashraIQ Platform Installer                ║
echo ║          Financial Intelligence Platform Setup             ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed.
    echo Please install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    docker compose version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Docker Compose is not installed.
        pause
        exit /b 1
    )
)

echo ✓ Docker detected
echo ✓ Docker Compose detected
echo.

REM Check if .env file exists
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env >nul
    echo ✓ .env file created
    echo.
    echo ⚠️  IMPORTANT: Edit .env file to add your API keys before running in production!
    echo.
)

echo ════════════════════════════════════════════════════════════
echo Starting NashraIQ Platform...
echo ════════════════════════════════════════════════════════════
echo.

REM Stop any existing containers
echo 🛑 Stopping existing containers (if any)...
docker-compose down 2>nul
echo.

REM Pull images
echo 📥 Pulling Docker images...
docker-compose pull
echo.

REM Build containers
echo 🔨 Building application containers...
docker-compose build
echo.

REM Start all services
echo 🚀 Starting all services...
docker-compose up -d
echo.

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service health
echo.
echo 🔍 Checking service health...
docker-compose ps

echo.
echo ════════════════════════════════════════════════════════════
echo ✨ Installation Complete!
echo ════════════════════════════════════════════════════════════
echo.
echo 🌐 Your NashraIQ platform is now running at:
echo.
echo    👉 http://localhost:3000
echo.
echo 📋 Demo Credentials:
echo    User:  demo@nashra-iq.com / demo123
echo    Admin: admin@nashra-iq.com / admin123
echo.
echo 🔧 Useful Commands:
echo    View logs:      docker-compose logs -f
echo    Stop platform:  docker-compose stop
echo    Restart:        docker-compose restart
echo    Full reset:     docker-compose down -v
echo.
echo 📚 Next Steps:
echo    1. Visit http://localhost:3000
echo    2. Edit .env to add your licensed API keys
echo    3. Restart with: docker-compose restart
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
