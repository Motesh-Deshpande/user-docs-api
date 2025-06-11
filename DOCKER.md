# Docker Setup for User Documents API

This document provides instructions for running the User Documents API using Docker and Docker Compose.

## Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)
- Make (optional, for using Makefile commands)

## Quick Start

### Production Environment

1. **Copy environment variables:**
   ```bash
   cp docker.env.example .env
   ```

2. **Edit environment variables:**
   ```bash
   nano .env
   ```
   Update the following variables:
   - `JWT_SECRET`: Use a strong, random secret key
   - `DB_PASSWORD`: Set a secure database password
   - Other variables as needed

3. **Start the application:**
   ```bash
   # Using Docker Compose
   docker-compose up -d

   # Or using Makefile
   make up
   ```

4. **Check if services are running:**
   ```bash
   docker-compose ps
   # or
   make ps
   ```

5. **Access the application:**
   - API: http://localhost:3000
   - Database: localhost:5432

### Development Environment

1. **Start development environment:**
   ```bash
   # Using Docker Compose
   docker-compose -f docker-compose.dev.yml up

   # Or using Makefile
   make dev-up
   ```

2. **Access development features:**
   - API with hot reload: http://localhost:3001
   - Debug port: 9229
   - Database: localhost:5433

## Available Services

### Production (`docker-compose.yml`)
- **app**: NestJS application (port 3000)
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)

### Development (`docker-compose.dev.yml`)
- **app**: NestJS application with hot reload (port 3001)
- **postgres**: PostgreSQL database (port 5433)
- **redis**: Redis cache (port 6380)

## Makefile Commands

Run `make help` to see all available commands:

### Production Commands
- `make build` - Build production Docker image
- `make up` - Start production environment
- `make down` - Stop production environment
- `make logs` - View production logs
- `make restart` - Restart production services

### Development Commands
- `make dev-build` - Build development Docker image
- `make dev-up` - Start development environment
- `make dev-down` - Stop development environment
- `make dev-logs` - View development logs
- `make dev-shell` - Access app container shell

### Database Commands
- `make db-migrate` - Run database migrations
- `make db-seed` - Seed database with initial data
- `make db-reset` - Reset database
- `make backup-db` - Backup production database
- `make restore-db FILE=backup.sql` - Restore database from backup

### Testing Commands
- `make test` - Run tests in container
- `make test-coverage` - Run tests with coverage
- `make test-e2e` - Run end-to-end tests

### Utility Commands
- `make clean` - Remove all containers, volumes, and images
- `make ps` - Show running production containers
- `make dev-ps` - Show running development containers

## Environment Variables

### Required Variables
- `JWT_SECRET`: Secret key for JWT token signing
- `DB_PASSWORD`: PostgreSQL database password

### Optional Variables
- `DB_NAME`: Database name (default: user_docs)
- `DB_USER`: Database user (default: postgres)
- `DB_PORT`: Database port (default: 5432)
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (default: production)
- `MAX_FILE_SIZE`: Maximum upload file size in bytes (default: 10MB)

## Volumes

### Production
- `postgres_data`: PostgreSQL data persistence
- `uploads_data`: File uploads storage
- `redis_data`: Redis data persistence

### Development
- `postgres_dev_data`: Development PostgreSQL data
- `uploads_dev_data`: Development uploads storage
- `redis_dev_data`: Development Redis data
- Local code volume: Hot reload for development

## Health Checks

All services include health checks:
- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping` command
- **App**: HTTP request to `/` endpoint

## Debugging

### Development Container
The development container exposes port 9229 for Node.js debugging:

```bash
# Start development environment
make dev-up

# In VS Code, add debug configuration:
{
  "type": "node",
  "request": "attach",
  "name": "Attach to Docker",
  "port": 9229,
  "address": "localhost",
  "restart": true,
  "sourceMaps": true,
  "outFiles": ["${workspaceFolder}/dist/**/*.js"]
}
```

### Accessing Container Shell
```bash
# Production
docker-compose exec app sh

# Development
make dev-shell
```

## Database Management

### Migrations
```bash
# Run migrations
make db-migrate

# Reset database
make db-reset
```

### Backup and Restore
```bash
# Create backup
make backup-db

# Restore from backup
make restore-db FILE=backup_20231201_120000.sql
```

### Direct Database Access
```bash
# Production
docker-compose exec postgres psql -U postgres user_docs

# Development
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres user_docs_dev
```

## Monitoring and Logs

### View Logs
```bash
# All services
make logs

# Specific service
docker-compose logs -f app

# Development logs
make dev-logs
```

### Monitor Resources
```bash
# Container stats
docker stats

# Service status
make ps
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` file
2. **Permission issues**: Check volume permissions
3. **Database connection**: Ensure PostgreSQL is healthy
4. **Build failures**: Check Dockerfile and dependencies

### Reset Everything
```bash
# Stop all services and remove data
make clean

# Rebuild and restart
make build && make up
```

### Check Service Health
```bash
# View health status
docker-compose ps

# Check specific service logs
docker-compose logs postgres
```

## Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT secret** (generate with `openssl rand -base64 32`)
3. **Enable SSL/TLS** for production deployments
4. **Limit exposed ports** in production
5. **Regular security updates** for base images
6. **Backup data regularly**

## Production Deployment

For production deployment:

1. Use environment-specific configuration
2. Set up proper monitoring and logging
3. Configure SSL/TLS certificates
4. Set up automated backups
5. Use container orchestration (Kubernetes, Docker Swarm)
6. Implement CI/CD pipelines

## Support

For issues related to Docker setup, check:
1. Docker daemon is running
2. Docker Compose version compatibility
3. Available system resources
4. Network connectivity
5. File permissions 