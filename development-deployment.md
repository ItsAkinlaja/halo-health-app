# Development Setup & Deployment Strategy

## Development Environment Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Git
- VS Code (recommended)

### Project Structure Setup

```bash
# Create main project directory
mkdir halo-health
cd halo-health

# Create subdirectories
mkdir frontend backend docs scripts

# Frontend setup (React Native + Expo)
cd frontend
npx create-expo-app . --template blank-typescript
npm install @supabase/supabase-js @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install expo-camera expo-barcode-scanner expo-speech expo-av expo-notifications
npm install @react-native-async-storage/async-storage react-native-svg react-native-reanimated
npm install react-native-gesture-handler react-native-maps

# Backend setup (Node.js)
cd ../backend
npm init -y
npm install express cors helmet morgan compression
npm install @supabase/supabase-js jsonwebtoken bcryptjs
npm install multer sharp bull redis
npm install socket.io openai @pinecone-database/pinecone
npm install nodemailer express-rate-limit express-validator
npm install winston --save-dev
npm install --save-dev nodemon jest supertest

# Development tools
cd ..
npm install -g @expo/cli
```

### Environment Configuration

#### Backend Environment (.env)
```env
# Database
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# Redis
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=<your-openai-api-key>
PINECONE_API_KEY=<your-pinecone-api-key>
PINECONE_ENVIRONMENT=<your-pinecone-environment>
ELEVENLABS_API_KEY=<your-elevenlabs-api-key>
GOOGLE_VISION_API_KEY=<your-google-vision-api-key>

# External APIs
OPEN_FOOD_FACTS_API_URL=https://world.openfoodfacts.org/api/v0

# JWT & Security
JWT_SECRET=<your-jwt-secret-key>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=<your-smtp-app-password>

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Push Notifications
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=<your-firebase-private-key>
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# App Configuration
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:19006
```

#### Frontend Environment (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_ENVIRONMENT=development
```

### Database Setup

#### Supabase Setup
```sql
-- Run the database schema from database-schema.md
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
-- ... enable for all user-specific tables

-- Create indexes for performance
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_product_scans_user_id ON product_scans(user_id);
CREATE INDEX idx_health_scores_recorded_at ON health_scores(recorded_at);
```

### Development Scripts

#### Package.json Scripts (Backend)
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  }
}
```

#### Package.json Scripts (Frontend)
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:android": "expo build:android",
    "build:ios": "expo build:ios",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix"
  }
}
```

## Development Workflow

### Git Workflow
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Halo Health project setup"

# Create branches
git checkout -b develop
git checkout -b feature/authentication
git checkout -b feature/scanning
git checkout -b feature/ai-coach

# Feature development workflow
git checkout feature/authentication
# ... work on feature ...
git add .
git commit -m "feat: implement user authentication"
git push origin feature/authentication
# Create pull request to develop
```

### Local Development Setup

#### Docker Compose (Optional)
```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: halo_health
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: <db-password>
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

#### Development Server Startup
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Redis (if not using Docker)
redis-server

# Terminal 4 - Database migrations (if needed)
cd backend
npm run migrate
```

## Testing Strategy

### Backend Testing
```javascript
// tests/setup.js
const { supabase } = require('../src/utils/database');

beforeAll(async () => {
  // Setup test database
  await setupTestDatabase();
});

afterAll(async () => {
  // Cleanup test database
  await cleanupTestDatabase();
});

// tests/unit/authService.test.js
const authService = require('../../src/services/authService');

describe('AuthService', () => {
  test('should register new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: '<test-password>',
      haloHealthId: 'testuser',
    };

    const result = await authService.signUp(
      userData.email,
      userData.password,
      userData.haloHealthId
    );

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(userData.email);
    expect(result.session).toBeDefined();
  });

  test('should login existing user', async () => {
    // Test login logic
  });
});
```

### Frontend Testing
```javascript
// __tests__/components/BarcodeScanner.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BarcodeScanner } from '../src/components/scanning/BarcodeScanner';

describe('BarcodeScanner', () => {
  test('should handle barcode scan', () => {
    const onScanComplete = jest.fn();
    const { getByTestId } = render(
      <BarcodeScanner onScanComplete={onScanComplete} profileId="test-profile" />
    );

    // Simulate barcode scan
    fireEvent(getByTestId('barcode-scanner'), 'barcodeScanned', {
      type: 'QR_CODE',
      data: '123456789',
    });

    expect(onScanComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });
});
```

### Integration Testing
```javascript
// tests/integration/scanning.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Scanning Integration', () => {
  test('should scan product by barcode', async () => {
    const response = await request(app)
      .post('/api/scans/barcode')
      .set('Authorization', 'Bearer valid-token')
      .send({
        barcode: '123456789',
        profileId: 'test-profile-id',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.product).toBeDefined();
  });
});
```

## Deployment Strategy

### Environment Architecture

#### Development Environment
- **Frontend**: Expo Development Build
- **Backend**: Local Node.js server
- **Database**: Supabase development project
- **AI Services**: Development API keys
- **File Storage**: Local filesystem

#### Staging Environment
- **Frontend**: Expo Preview builds
- **Backend**: Vercel/Heroku deployment
- **Database**: Supabase staging project
- **AI Services**: Staging API keys
- **File Storage**: Supabase Storage

#### Production Environment
- **Frontend**: App Store/Google Play builds
- **Backend**: AWS/Google Cloud deployment
- **Database**: Supabase production project
- **AI Services**: Production API keys
- **File Storage**: Supabase Storage + CDN

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Run tests
        run: cd backend && npm test
      
      - name: Run linting
        run: cd backend && npm run lint

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run tests
        run: cd frontend && npm test
      
      - name: Run linting
        run: cd frontend && npm run lint

  build-backend:
    needs: [test-backend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Deployment script for backend
          echo "Deploying backend to production"

  build-frontend:
    needs: [test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build iOS
        run: cd frontend && expo build:ios --non-interactive
      
      - name: Build Android
        run: cd frontend && expo build:android --non-interactive
```

### Backend Deployment Options

#### Vercel Deployment
```javascript
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/src/server.js"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "OPENAI_API_KEY": "@openai_api_key"
  }
}
```

#### AWS Deployment (Docker)
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

USER node

CMD ["npm", "start"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
```

### Frontend Deployment

#### Expo Application Services (EAS)
```json
// app.config.js
export default {
  expo: {
    name: "Halo Health",
    slug: "halo-health",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#4CAF50"
    },
    platforms: ["ios", "android"],
    ios: {
      bundleIdentifier: "com.halohealth.app",
      buildNumber: "1.0.0",
      supportsTablet: true
    },
    android: {
      package: "com.halohealth.app",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#4CAF50"
      }
    },
    plugins: [
      ["expo-camera"],
      ["expo-barcode-scanner"],
      ["expo-speech"],
      ["expo-notifications"]
    ],
    extra: {
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  }
};
```

#### EAS Build Configuration
```json
// eas.json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id",
        "appleIdPassword": "<your-app-specific-password>",
        "ascAppId": "your-asc-app-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### Database Migration Strategy

#### Migration Scripts
```javascript
// scripts/migrate.js
const { supabase } = require('../src/utils/database');
const fs = require('fs').promises;
const path = require('path');

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = await fs.readdir(migrationsDir);
    
    for (const file of migrationFiles.sort()) {
      if (file.endsWith('.sql')) {
        const migration = await fs.readFile(
          path.join(migrationsDir, file),
          'utf8'
        );
        
        console.log(`Running migration: ${file}`);
        await supabase.rpc('exec_sql', { sql: migration });
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
```

#### Seeding Scripts
```javascript
// scripts/seed.js
const { supabase } = require('../src/utils/database');

async function seedDatabase() {
  try {
    // Seed initial products
    const products = require('./seed-data/products.json');
    for (const product of products) {
      await supabase.from('products').insert([product]);
    }
    
    // Seed initial ingredients
    const ingredients = require('./seed-data/ingredients.json');
    for (const ingredient of ingredients) {
      await supabase.from('ingredients').insert([ingredient]);
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
```

### Monitoring & Logging

#### Application Monitoring
```javascript
// src/utils/monitoring.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'halo-health-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Performance monitoring
const performanceMonitor = {
  logApiCall: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('API Call', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
      });
    });
    
    next();
  },
  
  logError: (error, req) => {
    logger.error('API Error', {
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      body: req.body,
      userAgent: req.get('User-Agent'),
    });
  },
};

module.exports = { logger, performanceMonitor };
```

### Security Considerations

#### Security Headers
```javascript
// src/middleware/security.js
const helmet = require('helmet');

const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

module.exports = securityMiddleware;
```

#### Rate Limiting
```javascript
// src/middleware/rateLimiting.js
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const limits = {
  general: createRateLimit(15 * 60 * 1000, 100, 'Too many requests'),
  auth: createRateLimit(15 * 60 * 1000, 5, 'Too many auth attempts'),
  scanning: createRateLimit(60 * 1000, 20, 'Too many scans'),
  ai: createRateLimit(60 * 1000, 10, 'Too many AI requests'),
};

module.exports = limits;
```

### Backup Strategy

#### Database Backups
```bash
# scripts/backup.sh
#!/bin/bash

BACKUP_DIR="/backups/halo-health"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Run backup
pg_dump $DATABASE_URL > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Remove old backups (keep last 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

#### Automated Backup Cron Job
```bash
# Add to crontab
0 2 * * * /path/to/scripts/backup.sh
```

## Deployment Checklist

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance testing completed
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy tested
- [ ] Rollback plan prepared

### Post-deployment Checklist
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] AI services accessible
- [ ] Push notifications working
- [ ] File uploads functioning
- [ ] User authentication working
- [ ] Barcode scanning functional
- [ ] Voice features operational

## Scaling Strategy

### Horizontal Scaling
- Load balancer configuration
- Multiple backend instances
- Database read replicas
- CDN for static assets
- Auto-scaling policies

### Performance Optimization
- Database query optimization
- API response caching
- Image compression and CDN
- Code splitting and lazy loading
- Background job processing

### Cost Management
- API usage monitoring
- Database query optimization
- Caching strategies
- Resource usage tracking
- Cost alerts and budgets

This comprehensive development and deployment strategy ensures that Halo Health can be developed, tested, and deployed efficiently while maintaining high standards for security, performance, and reliability.
