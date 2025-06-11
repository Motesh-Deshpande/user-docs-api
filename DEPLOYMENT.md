# 🚀 Deployment Guide

This guide provides the quickest way to deploy the User-Docs API.

## ⚡ Quick Deploy (Docker - Recommended)

### 1. Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### 2. Deploy in 3 commands
```bash
# Clone and navigate
git clone https://github.com/Motesh-Deshpande/user-docs.git
cd user-docs

# Configure environment
cp docker.env.example .env
# Edit .env file - change DB_PASSWORD and JWT_SECRET

# Deploy
make up
```

**That's it!** API will be available at `http://localhost:3000`

### 3. Verify deployment
```bash
curl http://localhost:3000  # Should return "HealthCheck OK!"
```

## 🔧 Manual Deployment (Node.js)

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm

### 2. Setup Database
```bash
# Create database
createdb user_docs

# Or using psql
psql -c "CREATE DATABASE user_docs;"
```

### 3. Deploy Application
```bash
# Clone repository
git clone https://github.com/Motesh-Deshpande/user-docs.git
cd user-docs

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Build and start
npm run build
npm run start:prod
```

## 🧪 Test Deployment

```bash
# Run deployment check
./deploy-check.sh

# Test API endpoints
curl http://localhost:3000  # Health check

# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"viewer"}'

# Login (get token)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔒 Environment Configuration

### Required Variables
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password  # CHANGE THIS
DATABASE_NAME=user_docs

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars  # CHANGE THIS
```

### Docker Variables
```env
DB_NAME=user_docs
DB_USER=postgres
DB_PASSWORD=your_secure_password  # CHANGE THIS
JWT_SECRET=your-super-secret-jwt-key  # CHANGE THIS
```

## 🐳 Docker Commands

```bash
# Production deployment
make up                    # Start all services
make down                  # Stop all services
make logs                  # View logs
make ps                    # Show running containers

# Development
make dev-up                # Start development environment
make dev-down              # Stop development environment

# Utilities
make clean                 # Clean up everything
make backup-db             # Backup database
```

## 🔍 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check if PostgreSQL is running
docker-compose logs postgres
# Or for manual setup
systemctl status postgresql
```

**2. Port Already in Use**
```bash
# Change port in .env file
PORT=3001
# Or kill existing process
lsof -ti:3000 | xargs kill -9
```

**3. Permission Denied**
```bash
# Make scripts executable
chmod +x deploy-check.sh
```

**4. Build Failures**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📊 Health Checks

- **API Health**: `GET http://localhost:3000`
- **Database**: Automatic migrations on startup
- **Docker Health**: `docker-compose ps`

## 🏗️ Production Considerations

1. **Change default passwords** in `.env`
2. **Use strong JWT secrets** (32+ characters)
3. **Set up SSL/TLS** for HTTPS
4. **Configure firewall** for port 3000
5. **Set up monitoring** and logging
6. **Regular database backups** (`make backup-db`)

## 📞 Support

If deployment fails:
1. Run `./deploy-check.sh` for diagnostics
2. Check logs: `make logs` or `npm start`
3. Verify all environment variables are set
4. Ensure PostgreSQL is running and accessible

---

**Total deployment time: < 5 minutes** ⚡ 