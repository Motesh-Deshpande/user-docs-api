# User Documents API

A robust NestJS-based REST API for user authentication and document management with role-based access control, file upload capabilities, and document ingestion tracking.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Test Coverage](https://img.shields.io/badge/tests-46%2F46%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)
![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red)

## 🚀 Features

### Authentication & Authorization
- **JWT-based Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin, Editor, and Viewer roles
- **User Registration & Login** - Complete user management system
- **Protected Routes** - Middleware-based route protection

### Document Management
- **File Upload** - Secure file upload with configurable storage
- **Document CRUD Operations** - Create, read, update, delete documents
- **Metadata Management** - Title, description, and file path tracking
- **User Association** - Documents linked to uploading users
- **Soft Delete** - Documents marked as deleted instead of hard deletion

### Document Ingestion
- **Ingestion Tracking** - Monitor document processing status
- **Status Management** - Track pending, in-progress, completed, and failed states
- **Timestamps** - Created and updated timestamp tracking

### Security & Validation
- **Password Hashing** - Bcrypt-based password security
- **Input Validation** - Class-validator for request validation
- **Type Safety** - Full TypeScript implementation
- **Environment Configuration** - Secure configuration management

## 🛠️ Technology Stack

- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Database**: PostgreSQL (with TypeORM)
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **File Upload**: Multer
- **Testing**: Jest (46/46 tests passing)
- **Documentation**: Comprehensive API documentation

## 📋 Prerequisites

- Node.js (18.x or higher)
- PostgreSQL (12+ recommended)
- npm or yarn
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-docs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables:
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=user_docs
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb user_docs
   ```

5. **Start the application**
   ```bash
   # Development mode with hot reload
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Access the API**
   - API Base URL: `http://localhost:3000`
   - Health Check: `GET http://localhost:3000`

### Docker Deployment

For detailed Docker setup instructions, see [DOCKER.md](DOCKER.md).

**Quick Docker Start:**
```bash
# Production
cp docker.env.example .env
make up

# Development
make dev-up
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "viewer"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "viewer"
  }
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

### User Management Endpoints

#### Get All Users (Admin Only)
```http
GET /users
Authorization: Bearer <jwt_token>
```

#### Update User Role (Admin Only)
```http
POST /users/role
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userId": "uuid",
  "role": "editor"
}
```

### Document Endpoints

#### Upload Document
```http
POST /documents
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <file_upload>
title: "Document Title"
description: "Document Description"
```

#### Get All Documents
```http
GET /documents
Authorization: Bearer <jwt_token>
```

#### Get Document by ID
```http
GET /documents/:id
Authorization: Bearer <jwt_token>
```

#### Update Document
```http
PATCH /documents/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description"
}
```

#### Delete Document
```http
DELETE /documents/:id
Authorization: Bearer <jwt_token>
```

### Ingestion Endpoints

#### Trigger Document Ingestion
```http
POST /ingestion
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "documentId": "uuid"
}
```

#### Check Ingestion Status
```http
GET /ingestion/status/:id
Authorization: Bearer <jwt_token>
```

## 🗄️ Database Schema

### Users Table
| Column   | Type    | Description                    |
|----------|---------|--------------------------------|
| id       | UUID    | Primary key                    |
| email    | VARCHAR | Unique user email              |
| password | VARCHAR | Hashed password                |
| role     | ENUM    | admin, editor, viewer          |

### Documents Table
| Column      | Type    | Description                    |
|-------------|---------|--------------------------------|
| id          | UUID    | Primary key                    |
| title       | VARCHAR | Document title                 |
| description | TEXT    | Document description (optional)|
| filePath    | VARCHAR | File storage path              |
| uploadedBy  | UUID    | Foreign key to users table    |
| deleted     | BOOLEAN | Soft delete flag               |

### Ingestion Status Table
| Column    | Type     | Description                       |
|-----------|----------|-----------------------------------|
| id        | UUID     | Primary key                       |
| status    | ENUM     | pending, in_progress, completed, failed |
| createdAt | DATETIME | Creation timestamp                |
| updatedAt | DATETIME | Last update timestamp             |

## 🔐 User Roles & Permissions

### Role Hierarchy
- **Admin**: Full system access
  - Manage all users and roles
  - Access all documents
  - Full CRUD operations
  - System administration

- **Editor**: Content management
  - Upload and manage documents
  - Update document metadata
  - Trigger document ingestion
  - View all documents

- **Viewer**: Read-only access
  - View documents
  - Check ingestion status
  - Basic user operations

### Authentication Flow
1. User registers with email, password, and role
2. Password is hashed using bcrypt
3. User logs in to receive JWT token
4. JWT token required for all protected routes
5. Role-based middleware validates permissions

## 🧪 Testing

The project includes comprehensive test coverage with **46 passing tests** across 9 test suites.

### Test Structure
- **Unit Tests**: Service layer testing with mocked dependencies
- **Integration Tests**: Controller testing with HTTP requests
- **Authentication Tests**: JWT token validation and role-based access
- **Database Tests**: Entity relationships and data persistence

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run tests with debugging
npm run test:debug

# Run end-to-end tests
npm run test:e2e
```

### Test Coverage
- **Services**: 100% coverage for business logic
- **Controllers**: HTTP request/response testing
- **Authentication**: JWT and role-based access control
- **Database**: Entity operations and relationships
- **DTOs**: Input validation and transformation

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── jwt.strategy.ts
├── users/               # User management module
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── documents/           # Document management module
│   ├── dto/
│   ├── documents.controller.ts
│   ├── documents.service.ts
│   └── documents.module.ts
├── ingestion/           # Document ingestion module
│   ├── dto/
│   ├── ingestion.controller.ts
│   ├── ingestion.service.ts
│   └── ingestion.module.ts
├── database/            # Database entities
│   ├── user.entity.ts
│   ├── document.entity.ts
│   └── ingestion-status.entity.ts
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   └── guards/          # Route guards
├── tests/               # Test files
│   ├── auth/
│   ├── users/
│   ├── documents/
│   ├── ingestion/
│   └── setup.ts         # Test configuration
├── app.module.ts        # Main application module
└── main.ts              # Application entry point
```

## 🔧 Configuration

### Environment Variables

| Variable        | Description                    | Default   |
|-----------------|--------------------------------|-----------|
| DATABASE_HOST   | PostgreSQL host                | localhost |
| DATABASE_PORT   | PostgreSQL port                | 5432      |
| DATABASE_USER   | PostgreSQL username            | postgres  |
| DATABASE_PASSWORD| PostgreSQL password           | -         |
| DATABASE_NAME   | PostgreSQL database name       | user_docs |
| JWT_SECRET      | JWT signing secret             | -         |
| PORT            | Application port               | 3000      |

### File Upload Configuration
- **Upload Directory**: `./uploads`
- **Supported Formats**: All file types
- **File Naming**: Timestamp-based unique names
- **Storage**: Local disk storage (configurable)

## 📦 Available Scripts

| Script              | Description                    |
|---------------------|--------------------------------|
| `npm run build`     | Build the application          |
| `npm run start`     | Start production server        |
| `npm run start:dev` | Start development server       |
| `npm run start:debug` | Start with debugging         |
| `npm run lint`      | Run ESLint                     |
| `npm run format`    | Format code with Prettier     |
| `npm test`          | Run tests                      |
| `npm run test:cov`  | Run tests with coverage        |
| `npm run test:e2e`  | Run end-to-end tests          |

## 🐳 Docker Support

Complete Docker setup with:
- **Multi-stage builds** for optimized production images
- **Development and production** configurations
- **PostgreSQL and Redis** services
- **Volume management** for data persistence
- **Health checks** for service monitoring
- **Makefile** for easy Docker operations

See [DOCKER.md](DOCKER.md) for detailed Docker instructions.

## 🛡️ Security Features

### Authentication Security
- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Token Expiration**: Configurable token lifetime
- **Role-Based Access**: Granular permission control

### Application Security
- **Input Validation**: Class-validator for all inputs
- **Type Safety**: Full TypeScript implementation
- **CORS Protection**: Configurable CORS settings
- **Environment Variables**: Secure configuration management
- **Non-root Docker User**: Security-hardened containers

### File Upload Security
- **Path Validation**: Secure file path handling
- **File Type Validation**: Configurable file type restrictions
- **File Size Limits**: Configurable upload size limits
- **Secure Storage**: Isolated upload directory

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT secret
- [ ] Configure secure database credentials
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment variables
- [ ] Set up database migrations
- [ ] Configure file upload limits
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Deployment Options
1. **Docker Compose**: Simple containerized deployment
2. **Kubernetes**: Scalable orchestrated deployment
3. **Cloud Platforms**: AWS, GCP, Azure deployment
4. **Traditional VPS**: Manual server deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Use conventional commit messages
- Update documentation for API changes
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the UNLICENSED License.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Include reproduction steps and environment details

---

**Built with ❤️ using NestJS and TypeScript**
