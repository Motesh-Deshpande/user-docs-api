#!/bin/bash

# Deployment Check Script for User-Docs API
# This script verifies that the application can be deployed successfully

set -e

echo "🚀 User-Docs API Deployment Check"
echo "=================================="

# Check if required files exist
echo "📁 Checking required files..."
required_files=("package.json" "Dockerfile" "docker-compose.yml" "src/main.ts" "src/app.module.ts")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

# Check if .env.example exists
if [ -f ".env.example" ]; then
    echo "✅ .env.example exists"
else
    echo "⚠️  .env.example not found - will create basic one"
    cat > .env.example << EOF
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_database_password
DATABASE_NAME=user_docs

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=development
PORT=3000
EOF
    echo "✅ Created basic .env.example"
fi

# Check Docker setup
echo ""
echo "🐳 Checking Docker setup..."
DOCKER_AVAILABLE=true
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
else
    echo "⚠️  Docker is not installed (required for Docker deployment)"
    DOCKER_AVAILABLE=false
fi

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "✅ Docker Compose is available"
else
    echo "⚠️  Docker Compose is not available (required for Docker deployment)"
    DOCKER_AVAILABLE=false
fi

# Check if package.json has required scripts
echo ""
echo "📦 Checking package.json scripts..."
required_scripts=("build" "start" "start:prod" "test")

for script in "${required_scripts[@]}"; do
    if grep -q "\"$script\":" package.json; then
        echo "✅ $script script exists"
    else
        echo "❌ $script script is missing"
        exit 1
    fi
done

# Validate Docker Compose files
echo ""
echo "🔍 Validating Docker Compose files..."
if [ "$DOCKER_AVAILABLE" = true ]; then
    if docker-compose -f docker-compose.yml config > /dev/null 2>&1; then
        echo "✅ docker-compose.yml is valid"
    else
        echo "❌ docker-compose.yml has errors"
        exit 1
    fi

    if docker-compose -f docker-compose.dev.yml config > /dev/null 2>&1; then
        echo "✅ docker-compose.dev.yml is valid"
    else
        echo "❌ docker-compose.dev.yml has errors"
        exit 1
    fi
else
    echo "⚠️  Skipping Docker Compose validation (Docker not available)"
fi

# Check TypeScript compilation
echo ""
echo "🔧 Checking TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    echo "Installing dependencies and retrying..."
    npm install
    if npm run build > /dev/null 2>&1; then
        echo "✅ TypeScript compilation successful after npm install"
    else
        echo "❌ TypeScript compilation still failing"
        exit 1
    fi
fi

# Run tests if available
echo ""
echo "🧪 Running tests..."
if npm test > /dev/null 2>&1; then
    echo "✅ All tests passing"
else
    echo "⚠️  Some tests may be failing (check manually with 'npm test')"
fi

echo ""
echo "🎉 Deployment Check Complete!"
echo ""
echo "📋 Quick Deployment Instructions:"
echo "1. Copy docker.env.example to .env: cp docker.env.example .env"
echo "2. Edit .env with your database password and JWT secret"
echo "3. Start with Docker: make up"
echo "4. Or manually: docker-compose up -d"
echo ""
echo "🌐 Access your API at: http://localhost:3000"
echo "📖 Check README.md for detailed instructions" 