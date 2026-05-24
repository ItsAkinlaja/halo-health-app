require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const productRoutes = require('./routes/products');
const scanRoutes = require('./routes/scans');
const mealRoutes = require('./routes/meals');
const socialRoutes = require('./routes/social');
const communityRoutes = require('./routes/communities');
const challengeRoutes = require('./routes/challenges');
const notificationRoutes = require('./routes/notifications');
const coachRoutes = require('./routes/coach');
const userRoutes = require('./routes/users');
const jwksRoutes = require('./routes/jwks');
const alternativesRoutes = require('./routes/alternatives');
const restaurantRoutes = require('./routes/restaurant');
const shoppingListRoutes = require('./routes/shoppingList');
const referralRoutes = require('./routes/referral');
const recapCardsRoutes = require('./routes/recapCards');
const homeHealthRoutes = require('./routes/homeHealth');
const waterRoutes = require('./routes/water');
const supplementRoutes = require('./routes/supplements');
const newsRoutes = require('./routes/news');
const productSubmissionsRoutes = require('./routes/productSubmissions');
const pantryRoutes = require('./routes/pantry');

const { errorHandler } = require('./middleware/errorHandler');
const { logger, performanceMonitor } = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowed = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',')
      : [];

    // Always allow these origins
    const defaults = [
      'http://localhost:8081',
      'http://localhost:19006',
      'http://localhost:19000',
      'https://halo-health-app-production.up.railway.app',
    ];

    const allAllowed = [...defaults, ...allowed];

    if (allAllowed.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }

    // Allow all Expo Go origins (exp:// scheme comes as null origin on mobile)
    return callback(null, true);
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Performance monitoring
app.use(performanceMonitor.logApiCall);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alternatives', alternativesRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/recap-cards', recapCardsRoutes);
app.use('/api/home-health', homeHealthRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/supplements', supplementRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/product-submissions', productSubmissionsRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/.well-known', jwksRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Halo Health API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      profiles: '/api/profiles',
      products: '/api/products',
      scans: '/api/scans',
      meals: '/api/meals',
      social: '/api/social',
      communities: '/api/communities',
      challenges: '/api/challenges',
      notifications: '/api/notifications',
      coach: '/api/coach',
      alternatives: '/api/alternatives',
      restaurant: '/api/restaurant',
      shoppingList: '/api/shopping-list',
      referral: '/api/referral',
      recapCards: '/api/recap-cards',
      homeHealth: '/api/home-health',
      water: '/api/water',
      supplements: '/api/supplements',
      news: '/api/news',
      productSubmissions: '/api/product-submissions',
      pantry: '/api/pantry',
    },
    documentation: 'https://docs.halohealth.com',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling
app.use(errorHandler);

module.exports = app;
