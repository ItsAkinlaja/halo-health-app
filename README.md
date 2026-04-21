# Halo Health

An all-in-one intelligent product safety and healthy living companion that helps people discover what is really inside the products they buy, eat, drink, and use every day.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Git

### Setup

1. **Clone and setup the project:**
```bash
# Clone the repository
git clone <repository-url>
cd halo-health

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

2. **Configure environment variables:**
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase and API keys

# Frontend environment  
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your Supabase URL
```

3. **Start development servers:**
```bash
# Start both frontend and backend
chmod +x scripts/dev.sh
./scripts/dev.sh
```

Or start them individually:
```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm start
```

## Project Structure

```
halo-health/
frontend/                 # React Native app (Expo)
  src/
    components/          # Reusable UI components
    screens/             # App screens
    navigation/          # Navigation configuration
    services/            # API services
    hooks/               # Custom hooks
    store/               # State management
    utils/               # Utility functions
    styles/              # Styling
    types/               # TypeScript definitions

backend/                 # Node.js API server
  src/
    controllers/         # Route controllers
    services/            # Business logic
    models/              # Data models
    middleware/          # Custom middleware
    routes/              # API routes
    utils/               # Utility functions
    config/              # Configuration
    jobs/                # Background jobs

docs/                    # Documentation
migrations/              # Database migrations
scripts/                 # Development scripts
```

## Technology Stack

### Frontend
- **React Native** with **Expo CLI**
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Redux Toolkit** for state management
- **Supabase** for authentication and real-time
- **Expo Camera** for barcode scanning
- **Expo Speech** for voice features

### Backend
- **Node.js** with **Express**
- **Supabase** (PostgreSQL) for database
- **Redis** for caching and sessions
- **OpenAI** for AI features
- **Socket.io** for real-time features
- **Bull** for background jobs

### AI & Services
- **OpenAI GPT-4** for product analysis and coaching
- **ElevenLabs** for voice synthesis
- **Google Vision API** for OCR
- **Pinecone** for vector search

## Key Features

### Core Functionality
- **Barcode Scanning** - Instant product analysis
- **Photo Scanning** - OCR for ingredient labels
- **Restaurant Menu Analysis** - Health scoring for menu items
- **Personal Health Profiles** - Family member management
- **AI Coach (Halo)** - Personalized health guidance
- **Voice Interface** - Hands-free operation

### Advanced Features
- **Meal Planning** - AI-generated personalized meal plans
- **Social Features** - Community and sharing
- **Health Score Tracking** - Comprehensive health metrics
- **Product Recommendations** - Smart alternative suggestions
- **Notification System** - Recall alerts and health tips
- **Referral Program** - User growth and earnings

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format
```

### Environment Variables

#### Backend (.env)
```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
OPENAI_API_KEY=<your-openai-api-key>
JWT_SECRET=<your-jwt-secret>
REDIS_URL=redis://localhost:6379
```

#### Frontend (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout

### Product Endpoints
- `GET /api/products/search` - Search products
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `POST /api/scans/barcode` - Scan product by barcode
- `POST /api/scans/photo` - Scan product by photo

### Health Check
- `GET /health` - Server health status
- `GET /api` - API information

## Deployment

### Frontend (Expo)
```bash
# Build for production
expo build:android
expo build:ios
```

### Backend
```bash
# Production deployment
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Check the documentation in `/docs`
- Create an issue on GitHub
- Contact the development team

---

Built with React Native, Node.js, Supabase, and AI technologies.
