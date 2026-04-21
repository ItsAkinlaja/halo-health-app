/**
 * Feature Flags Middleware
 * Enables gradual rollout of features to users
 */

const featureFlags = {
  // Social Features
  SOCIAL_POSTS: process.env.FEATURE_SOCIAL_POSTS === 'true' || false,
  SOCIAL_COMMENTS: process.env.FEATURE_SOCIAL_COMMENTS === 'true' || false,
  SOCIAL_LIKES: process.env.FEATURE_SOCIAL_LIKES === 'true' || false,
  SOCIAL_FOLLOWS: process.env.FEATURE_SOCIAL_FOLLOWS === 'true' || false,
  SOCIAL_SHARES: process.env.FEATURE_SOCIAL_SHARES === 'true' || false,
  SOCIAL_HASHTAGS: process.env.FEATURE_SOCIAL_HASHTAGS === 'true' || false,
  SOCIAL_ACTIVITY_FEED: process.env.FEATURE_SOCIAL_ACTIVITY_FEED === 'true' || false,
  
  // Community Features
  COMMUNITIES: process.env.FEATURE_COMMUNITIES === 'true' || false,
  COMMUNITY_POSTS: process.env.FEATURE_COMMUNITY_POSTS === 'true' || false,
  
  // Product Reviews
  PRODUCT_REVIEWS: process.env.FEATURE_PRODUCT_REVIEWS === 'true' || false,
  
  // Advanced Features
  USER_BLOCKS: process.env.FEATURE_USER_BLOCKS === 'true' || false,
  POST_REPORTS: process.env.FEATURE_POST_REPORTS === 'true' || false,
};

/**
 * Check if a feature is enabled
 */
function isFeatureEnabled(featureName) {
  return featureFlags[featureName] === true;
}

/**
 * Middleware to check if a feature is enabled
 */
function requireFeature(featureName) {
  return (req, res, next) => {
    if (!isFeatureEnabled(featureName)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FEATURE_DISABLED',
          message: `The ${featureName} feature is currently disabled`,
        },
      });
    }
    next();
  };
}

/**
 * Middleware to check if user has access to beta features
 */
function requireBetaAccess(req, res, next) {
  const userId = req.user?.id;
  
  // Check if user is in beta list
  const betaUsers = (process.env.BETA_USERS || '').split(',').filter(Boolean);
  
  if (betaUsers.includes(userId)) {
    return next();
  }
  
  // Check if user has beta flag in metadata
  if (req.user?.user_metadata?.beta_access === true) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: {
      code: 'BETA_ACCESS_REQUIRED',
      message: 'This feature is currently in beta and requires special access',
    },
  });
}

/**
 * Middleware for gradual rollout (percentage-based)
 */
function gradualRollout(percentage = 100) {
  return (req, res, next) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return next();
    }
    
    // Use user ID to determine if they're in the rollout
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const userPercentage = Math.abs(hash % 100);
    
    if (userPercentage < percentage) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: {
        code: 'FEATURE_NOT_AVAILABLE',
        message: 'This feature is not yet available for your account',
      },
    });
  };
}

/**
 * Get all feature flags status
 */
function getFeatureFlags(req, res) {
  const userId = req.user?.id;
  const isBetaUser = req.user?.user_metadata?.beta_access === true;
  
  // Return feature flags available to this user
  const availableFeatures = {};
  
  Object.keys(featureFlags).forEach(feature => {
    availableFeatures[feature] = featureFlags[feature];
  });
  
  res.json({
    success: true,
    data: {
      features: availableFeatures,
      beta_access: isBetaUser,
    },
  });
}

/**
 * Admin endpoint to update feature flags (requires admin role)
 */
function updateFeatureFlag(req, res) {
  const { feature, enabled } = req.body;
  
  if (!featureFlags.hasOwnProperty(feature)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FEATURE',
        message: 'Invalid feature name',
      },
    });
  }
  
  featureFlags[feature] = enabled;
  
  res.json({
    success: true,
    data: {
      feature,
      enabled,
    },
  });
}

module.exports = {
  featureFlags,
  isFeatureEnabled,
  requireFeature,
  requireBetaAccess,
  gradualRollout,
  getFeatureFlags,
  updateFeatureFlag,
};
