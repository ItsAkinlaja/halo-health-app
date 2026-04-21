const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'halo-health-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Performance monitoring utilities
const performanceMonitor = {
  logApiCall: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('API Call', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
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
      ip: req.ip || req.connection.remoteAddress,
    });
  },
  
  logPerformance: (operation, duration, metadata = {}) => {
    logger.info('Performance', {
      operation,
      duration: `${duration}ms`,
      ...metadata,
    });
  },
};

// Database query logging
const logQuery = (query, duration, error = null) => {
  if (error) {
    logger.error('Database Query Error', {
      query: query.substring(0, 200), // Truncate long queries
      duration: `${duration}ms`,
      error: error.message,
    });
  } else {
    logger.debug('Database Query', {
      query: query.substring(0, 200),
      duration: `${duration}ms`,
    });
  }
};

// AI service logging
const logAICall = (service, operation, duration, tokens = null, error = null) => {
  if (error) {
    logger.error('AI Service Error', {
      service,
      operation,
      duration: `${duration}ms`,
      error: error.message,
    });
  } else {
    logger.info('AI Service Call', {
      service,
      operation,
      duration: `${duration}ms`,
      tokens,
    });
  }
};

module.exports = { 
  logger, 
  performanceMonitor, 
  logQuery, 
  logAICall 
};
