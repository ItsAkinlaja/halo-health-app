# Node.js Backend Architecture

## Project Setup

```bash
mkdir halo-health-backend
cd halo-health-backend
npm init -y
npm install express cors helmet morgan compression
npm install @supabase/supabase-js
npm install jsonwebtoken bcryptjs
npm install multer sharp
npm install bull redis
npm install socket.io
npm install openai @pinecone-database/pinecone
npm install nodemailer
npm install express-rate-limit express-validator
npm install winston
npm install --save-dev nodemon jest supertest
```

## Project Structure

```
halo-health-backend/
src/
  controllers/          # Route controllers
    authController.js
    userController.js
    productController.js
    scanController.js
    mealController.js
    socialController.js
    communityController.js
    challengeController.js
    notificationController.js
  
  services/             # Business logic services
    authService.js
    productService.js
    scanService.js
    aiService.js
    voiceService.js
    barcodeService.js
    imageAnalysisService.js
    mealPlanningService.js
    healthScoreService.js
    notificationService.js
    emailService.js
    recommendationEngine.js
  
  models/               # Data models
    User.js
    Product.js
    HealthProfile.js
    Scan.js
    MealPlan.js
    Community.js
  
  middleware/           # Custom middleware
    auth.js
    validation.js
    rateLimiting.js
    errorHandler.js
    logging.js
  
  routes/              # API routes
    auth.js
    users.js
    products.js
    scans.js
    meals.js
    social.js
    communities.js
    challenges.js
    notifications.js
  
  utils/               # Utility functions
    database.js
    logger.js
    helpers.js
    constants.js
    validators.js
  
  jobs/                # Background jobs
    productIndexing.js
    labDataProcessing.js
    notificationQueue.js
    healthScoreCalculation.js
    communityDigest.js
  
  config/              # Configuration files
    database.js
    redis.js
    email.js
    ai.js
  
  tests/               # Test files
    unit/
    integration/
    e2e/
  
  app.js               # Express app setup
  server.js            # Server entry point
```

## Core API Endpoints

### Authentication Routes
```javascript
// src/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('haloHealthId').isLength({ min: 3, max: 20 }),
  validateRequest
], authController.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validateRequest
], authController.login);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
```

### Product Routes
```javascript
// src/routes/products.js
const express = require('express');
const { query } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/search', [
  query('q').notEmpty(),
  query('category').optional().isIn(['food', 'beverage', 'supplement', 'personal_care', 'household']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], productController.searchProducts);

router.get('/barcode/:barcode', productController.getProductByBarcode);
router.get('/:id', productController.getProductById);
router.get('/category/:category/top-rated', productController.getTopRatedByCategory);
router.get('/alternatives/:productId', productController.getCleanAlternatives);

// Protected routes
router.use(authenticate);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
```

### Scan Routes
```javascript
// src/routes/scans.js
const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const scanController = require('../controllers/scanController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/barcode', [
  authenticate,
  body('barcode').notEmpty(),
  body('profileId').isUUID(),
], scanController.scanByBarcode);

router.post('/photo', [
  authenticate,
  upload.single('image'),
  body('profileId').isUUID(),
], scanController.scanByPhoto);

router.post('/menu', [
  authenticate,
  upload.single('menuImage'),
  body('restaurantId').optional().isUUID(),
  body('profileId').isUUID(),
], scanController.scanRestaurantMenu);

router.get('/history', authenticate, scanController.getScanHistory);
router.get('/recent', authenticate, scanController.getRecentScans);

module.exports = router;
```

### Meal Planning Routes
```javascript
// src/routes/meals.js
const express = require('express');
const { body, query } = require('express-validator');
const mealController = require('../controllers/mealController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/plans/generate', [
  body('profileId').isUUID(),
  body('duration').isIn([1, 3, 7, 14, 30]),
  body('preferences').isObject(),
], mealController.generateMealPlan);

router.get('/plans', mealController.getMealPlans);
router.get('/plans/:id', mealController.getMealPlanById);
router.put('/plans/:id', mealController.updateMealPlan);
router.delete('/plans/:id', mealController.deleteMealPlan);

router.post('/shopping-lists', mealController.createShoppingList);
router.get('/shopping-lists', mealController.getShoppingLists);
router.put('/shopping-lists/:id/items/:itemId', mealController.updateShoppingListItem);

router.get('/recipes/search', mealController.searchRecipes);
router.get('/recipes/:id', mealController.getRecipeById);

module.exports = router;
```

## Core Services

### Product Service
```javascript
// src/services/productService.js
const { supabase } = require('../utils/database');
const { calculateHealthScore } = require('../utils/calculations');
const { analyzeIngredients } = require('./aiService');

class ProductService {
  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...productData,
        health_score: await calculateHealthScore(productData),
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getProductByBarcode(barcode) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();
    
    if (error && error.code === 'PGRST116') {
      return null; // Product not found
    }
    
    if (error) throw error;
    return data;
  }

  async searchProducts(query, filters = {}) {
    let dbQuery = supabase
      .from('products')
      .select('*')
      .textSearch('name', query);

    if (filters.category) {
      dbQuery = dbQuery.eq('category', filters.category);
    }

    if (filters.minScore) {
      dbQuery = dbQuery.gte('health_score', filters.minScore);
    }

    const { data, error } = await dbQuery
      .order('health_score', { ascending: false })
      .limit(filters.limit || 20);

    if (error) throw error;
    return data;
  }

  async getCleanAlternatives(productId, userProfile) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) throw productError;

    // Find alternatives in same category with higher score
    const { data: alternatives, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .gt('health_score', product.health_score)
      .order('health_score', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Filter alternatives based on user profile
    return alternatives.filter(alt => 
      this.isCompatibleWithProfile(alt, userProfile)
    );
  }

  async analyzeProductImage(imageBuffer) {
    // Use AI to extract text and ingredients from product image
    const extractedText = await this.extractTextFromImage(imageBuffer);
    const ingredients = await this.parseIngredients(extractedText);
    
    // Try to identify the product
    const product = await this.identifyProductFromImage(extractedText, ingredients);
    
    return {
      extractedText,
      ingredients,
      identifiedProduct: product,
    };
  }

  isCompatibleWithProfile(product, profile) {
    // Check if product is compatible with user's dietary restrictions, allergies, etc.
    const { dietary_restrictions, allergies_intolerances, ingredient_preferences } = profile;
    
    // Implementation logic for compatibility checking
    return true; // Placeholder
  }

  async extractTextFromImage(imageBuffer) {
    // Use OCR service (Google Vision API, AWS Textract, etc.)
    // This would integrate with an external OCR service
    return "Extracted text from image";
  }

  async parseIngredients(text) {
    // Use AI to parse and structure ingredients from text
    return [];
  }

  async identifyProductFromImage(text, ingredients) {
    // Try to match extracted data with existing products
    return null;
  }
}

module.exports = new ProductService();
```

### AI Service (Halo Coach)
```javascript
// src/services/aiService.js
const OpenAI = require('openai');
const { PineconeClient } = require('@pinecone-database/pinecone');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.pinecone = new PineconeClient();
    this.pinecone.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
  }

  async generateProductAnalysis(product, userProfile) {
    const prompt = this.buildProductAnalysisPrompt(product, userProfile);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are Halo, an AI health coach. Analyze products using scientific evidence and explain impacts in plain language with bracketed explanations for technical terms.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  }

  buildProductAnalysisPrompt(product, userProfile) {
    return `
Analyze this product for the user's health profile:

Product: ${product.name}
Brand: ${product.brand}
Ingredients: ${product.ingredients.join(', ')}
Health Score: ${product.health_score}/100
Processing Level: ${product.processing_level}

User Profile:
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}
- Allergies: ${userProfile.allergies_intolerances?.join(', ') || 'None'}
- Health Concerns: ${userProfile.health_concerns?.join(', ') || 'None'}

Provide:
1. Overall assessment with score explanation
2. Specific problematic ingredients and their health impacts
3. Scientific explanations in accessible language
4. Recommendations for alternatives if needed
    `;
  }

  async generateMealPlan(preferences, userProfile) {
    const prompt = this.buildMealPlanPrompt(preferences, userProfile);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a nutritionist and meal planning expert. Create personalized meal plans that avoid allergens and dietary restrictions while meeting health goals.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.4,
    });

    return this.parseMealPlanResponse(response.choices[0].message.content);
  }

  buildMealPlanPrompt(preferences, userProfile) {
    return `
Create a ${preferences.duration}-day meal plan with the following requirements:

User Profile:
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}
- Allergies: ${userProfile.allergies_intolerances?.join(', ') || 'None'}
- Health Concerns: ${userProfile.health_concerns?.join(', ') || 'None'}

Preferences:
- Daily Calories: ${preferences.calorieTarget || 'Auto-calculate'}
- Cuisine Types: ${preferences.cuisinePreferences?.join(', ') || 'Any'}
- Cooking Time Limit: ${preferences.cookingTimeLimit || 'No limit'} minutes
- Budget: $${preferences.budgetWeekly || 'No limit'} per week
- Health Goals: ${preferences.healthGoals?.join(', ') || 'None'}

Provide a structured meal plan with:
- Breakfast, Lunch, Dinner, Snacks for each day
- Recipes with ingredients and instructions
- Nutritional information per meal
- Shopping list organized by store section
    `;
  }

  async generatePersonalizedTip(userProfile, recentActivity) {
    const prompt = `
Generate a personalized daily health tip based on:

User Profile:
- Health Score: ${userProfile.healthScore || 'Not calculated'}
- Recent Scans: ${recentActivity.recentScans?.length || 0} products
- Recent Clean Swaps: ${recentActivity.cleanSwaps || 0}
- Health Concerns: ${userProfile.health_concerns?.join(', ') || 'None'}

Make the tip actionable, encouraging, and specific to their recent activity and health goals.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Halo, an encouraging AI health coach. Provide personalized, actionable health tips.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  }

  async transcribeAudio(audioBuffer) {
    // Use OpenAI Whisper for transcription
    const response = await this.openai.audio.transcriptions.create({
      file: audioBuffer,
      model: 'whisper-1',
    });

    return response.text;
  }

  async generateVoiceResponse(text, voiceType = 'calm_clear_female') {
    // Integrate with text-to-speech service (ElevenLabs, Google TTS, etc.)
    return {
      audioUrl: `https://api.tts-service.com/generate?text=${encodeURIComponent(text)}&voice=${voiceType}`,
      text,
    };
  }

  parseMealPlanResponse(response) {
    // Parse AI response into structured meal plan data
    // This would involve parsing the structured text response
    return {
      meals: [],
      recipes: [],
      shoppingList: [],
    };
  }
}

module.exports = new AIService();
```

### Scan Service
```javascript
// src/services/scanService.js
const { supabase } = require('../utils/database');
const productService = require('./productService');
const aiService = require('./aiService');
const healthScoreService = require('./healthScoreService');

class ScanService {
  async scanByBarcode(barcode, userId, profileId) {
    // Check if product exists in database
    let product = await productService.getProductByBarcode(barcode);
    
    if (!product) {
      // Product not found, return needs photo scan
      return {
        success: false,
        needsPhotoScan: true,
        barcode,
      };
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    // Generate personalized analysis
    const analysis = await aiService.generateProductAnalysis(product, profile);
    
    // Calculate personalized score
    const personalizedScore = await this.calculatePersonalizedScore(product, profile);
    
    // Record the scan
    await this.recordScan(userId, profileId, product.id, 'barcode', personalizedScore);
    
    return {
      success: true,
      product: {
        ...product,
        personalized_score: personalizedScore,
        halo_analysis: analysis,
      },
    };
  }

  async scanByPhoto(imageBuffer, userId, profileId) {
    // Analyze product image
    const analysis = await productService.analyzeProductImage(imageBuffer);
    
    let product = analysis.identifiedProduct;
    
    if (!product) {
      // Create new product from extracted data
      product = await productService.createProduct({
        name: analysis.extractedText.split('\n')[0], // First line as product name
        ingredients: analysis.ingredients,
        category: 'unknown',
        processing_level: 'medium',
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    // Generate analysis
    const haloAnalysis = await aiService.generateProductAnalysis(product, profile);
    const personalizedScore = await this.calculatePersonalizedScore(product, profile);
    
    // Record the scan
    await this.recordScan(userId, profileId, product.id, 'photo', personalizedScore);
    
    return {
      success: true,
      product: {
        ...product,
        personalized_score: personalizedScore,
        halo_analysis: haloAnalysis,
        extracted_data: analysis,
      },
    };
  }

  async scanRestaurantMenu(imageBuffer, restaurantId, userId, profileId) {
    // Extract menu items from image
    const menuText = await this.extractMenuText(imageBuffer);
    const menuItems = await this.parseMenuItems(menuText);
    
    // Get user profile
    const { data: profile } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    // Analyze each menu item
    const analyzedItems = await Promise.all(
      menuItems.map(async (item) => {
        const analysis = await aiService.generateMenuAnalysis(item, profile);
        return {
          ...item,
          health_score: analysis.score,
          status: analysis.status, // 'clean', 'caution', 'avoid'
          reasons: analysis.reasons,
        };
      })
    );

    return {
      success: true,
      menu_items: analyzedItems,
      restaurant_id: restaurantId,
    };
  }

  async calculatePersonalizedScore(product, profile) {
    let baseScore = product.health_score;
    
    // Adjust score based on user profile
    const { dietary_restrictions, allergies_intolerances, ingredient_preferences } = profile;
    
    // Deduct points for incompatible ingredients
    if (dietary_restrictions) {
      for (const restriction of dietary_restrictions) {
        if (this.hasIncompatibleIngredient(product, restriction)) {
          baseScore -= 20;
        }
      }
    }
    
    if (allergies_intolerances) {
      for (const allergy of allergies_intolerances) {
        if (this.hasAllergen(product, allergy)) {
          baseScore -= 30;
        }
      }
    }
    
    return Math.max(0, Math.min(100, baseScore));
  }

  async recordScan(userId, profileId, productId, scanType, score) {
    const { error } = await supabase
      .from('product_scans')
      .insert([{
        user_id: userId,
        profile_id: profileId,
        product_id: productId,
        scan_type: scanType,
        score_given: score,
        created_at: new Date().toISOString(),
      }]);

    if (error) throw error;
    
    // Update user's health score
    await healthScoreService.updateHealthScore(userId, profileId);
  }

  hasIncompatibleIngredient(product, restriction) {
    // Check if product contains ingredients incompatible with restriction
    // Implementation depends on restriction mapping
    return false;
  }

  hasAllergen(product, allergy) {
    // Check if product contains allergen
    return product.allergens_present?.includes(allergy);
  }

  async extractMenuText(imageBuffer) {
    // Use OCR to extract text from menu image
    return "Extracted menu text";
  }

  async parseMenuItems(menuText) {
    // Parse menu items from extracted text
    return [];
  }
}

module.exports = new ScanService();
```

### Health Score Service
```javascript
// src/services/healthScoreService.js
const { supabase } = require('../utils/database');

class HealthScoreService {
  async calculateUserHealthScore(userId, profileId) {
    // Get recent scans (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: scans, error } = await supabase
      .from('product_scans')
      .select(`
        score_given,
        products!inner(
          category
        )
      `)
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (error) throw error;

    // Calculate scores by category
    const categoryScores = this.calculateCategoryScores(scans);
    
    // Calculate overall score (weighted average)
    const overallScore = this.calculateOverallScore(categoryScores);

    // Save the score
    await this.saveHealthScore(userId, profileId, overallScore, categoryScores);

    return {
      overall: overallScore,
      categories: categoryScores,
    };
  }

  calculateCategoryScores(scans) {
    const categories = ['food', 'beverage', 'supplement', 'personal_care', 'household'];
    const scores = {};

    categories.forEach(category => {
      const categoryScans = scans.filter(scan => 
        scan.products.category === category
      );

      if (categoryScans.length === 0) {
        scores[category] = null;
      } else {
        const averageScore = categoryScans.reduce((sum, scan) => 
          sum + scan.score_given, 0) / categoryScans.length;
        scores[category] = Math.round(averageScore);
      }
    });

    return scores;
  }

  calculateOverallScore(categoryScores) {
    const weights = {
      food: 0.4,
      beverage: 0.2,
      supplement: 0.15,
      personal_care: 0.15,
      household: 0.1,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score !== null) {
        totalScore += score * weights[category];
        totalWeight += weights[category];
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  async saveHealthScore(userId, profileId, overallScore, categoryScores) {
    const { error } = await supabase
      .from('health_scores')
      .insert([{
        user_id: userId,
        profile_id: profileId,
        overall_score: overallScore,
        food_score: categoryScores.food,
        beverage_score: categoryScores.beverage,
        supplement_score: categoryScores.supplement,
        personal_care_score: categoryScores.personal_care,
        household_score: categoryScores.household,
        recorded_at: new Date().toISOString(),
      }]);

    if (error) throw error;
  }

  async getHealthScoreHistory(userId, profileId, days = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('health_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async updateHealthScore(userId, profileId) {
    // Triggered after each scan
    await this.calculateUserHealthScore(userId, profileId);
  }
}

module.exports = new HealthScoreService();
```

### Notification Service
```javascript
// src/services/notificationService.js
const { supabase } = require('../utils/database');
const Queue = require('bull');
const redis = require('../config/redis');

class NotificationService {
  constructor() {
    this.notificationQueue = new Queue('notifications', { redis });
    this.setupProcessors();
  }

  setupProcessors() {
    this.notificationQueue.process('daily-tip', async (job) => {
      const { userId, tip } = job.data;
      await this.sendPushNotification(userId, {
        title: "Daily Health Tip from Halo",
        body: tip,
        type: 'daily_tip',
      });
    });

    this.notificationQueue.process('recall-alert', async (job) => {
      const { userId, product } = job.data;
      await this.sendPushNotification(userId, {
        title: "Product Recall Alert",
        body: `${product.name} has been recalled. Check your saved products.`,
        type: 'recall_alert',
        data: { productId: product.id },
      });
    });
  }

  async scheduleDailyTip(userId, tip, time = { hour: 9, minute: 0 }) {
    await this.notificationQueue.add('daily-tip', {
      userId,
      tip,
    }, {
      repeat: { cron: `${time.minute} ${time.hour} * * *` },
    });
  }

  async sendRecallAlert(userId, product) {
    await this.notificationQueue.add('recall-alert', {
      userId,
      product,
    }, {
      priority: 'high',
    });
  }

  async sendPushNotification(userId, notificationData) {
    // Save to database
    await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title: notificationData.title,
        message: notificationData.body,
        notification_type: notificationData.type,
        data: notificationData.data || {},
        created_at: new Date().toISOString(),
      }]);

    // Send push notification (would integrate with Firebase, OneSignal, etc.)
    // This is where you'd integrate with your push notification service
    console.log(`Sending push notification to user ${userId}:`, notificationData);
  }

  async getUserNotifications(userId, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async markNotificationAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }
}

module.exports = new NotificationService();
```

## Background Jobs

### Product Indexing Job
```javascript
// src/jobs/productIndexing.js
const Queue = require('bull');
const redis = require('../config/redis');
const productService = require('../services/productService');

const productIndexingQueue = new Queue('product-indexing', { redis });

productIndexingQueue.process('index-product', async (job) => {
  const { productData } = job.data;
  
  // Process and index product data
  await productService.createProduct(productData);
  
  // Update search indexes
  await updateSearchIndex(productData);
});

async function updateSearchIndex(product) {
  // Update Pinecone vector database for semantic search
  // Implementation for vector search
}

module.exports = productIndexingQueue;
```

## Express App Setup

### Main App File
```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const scanRoutes = require('./routes/scans');
const mealRoutes = require('./routes/meals');
const socialRoutes = require('./routes/social');
const communityRoutes = require('./routes/communities');
const challengeRoutes = require('./routes/challenges');
const notificationRoutes = require('./routes/notifications');

const { errorHandler } = require('./middleware/errorHandler');
const { logging } = require('./middleware/logging');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

module.exports = app;
```

### Server Entry Point
```javascript
// src/server.js
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000",
    methods: ['GET', 'POST'],
  },
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
  });

  // Join community rooms
  socket.on('join-community', (communityId) => {
    socket.join(`community-${communityId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
```

## Environment Configuration

### .env.example
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

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=<your-smtp-app-password>

# JWT
JWT_SECRET=<your-jwt-secret-key>
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Push Notifications
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=<your-firebase-private-key>
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# External APIs
GOOGLE_VISION_API_KEY=<your-google-vision-api-key>
NUTRITION_API_KEY=<your-nutrition-api-key>

# App
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
```

This backend architecture provides:

1. **Scalable API structure** with proper separation of concerns
2. **AI integration** for Halo coach features using OpenAI
3. **Background job processing** for heavy tasks
4. **Real-time capabilities** with Socket.io
5. **Comprehensive error handling** and logging
6. **Security measures** with rate limiting and validation
7. **Modular design** for easy maintenance and scaling
