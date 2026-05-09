const jwt = require('jsonwebtoken');
const { logger } = require('./logger');

// Use a secret from env. No file system dependencies — works in any deployment.
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (JWT_SECRET ? JWT_SECRET + '_refresh' : null);

if (!JWT_SECRET) {
  logger.warn(
    '⚠️  JWT_SECRET is not set in environment variables. ' +
    'Set JWT_SECRET in your Railway/production environment. ' +
    'Using an insecure default for development only.'
  );
}

const SECRET = JWT_SECRET || 'halo-health-dev-secret-change-in-production';
const REFRESH_TOKEN_SECRET = REFRESH_SECRET || 'halo-health-refresh-dev-secret-change-in-production';

// Generate access token
function generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') {
  return jwt.sign(payload, SECRET, {
    algorithm: 'HS256',
    expiresIn,
  });
}

// Verify access token
function verifyToken(token) {
  return jwt.verify(token, SECRET, { algorithms: ['HS256'] });
}

// Generate refresh token (uses a different secret so it can't be used as an access token)
function generateRefreshToken(payload, expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d') {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    REFRESH_TOKEN_SECRET,
    { algorithm: 'HS256', expiresIn }
  );
}

// Verify refresh token
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET, { algorithms: ['HS256'] });
}

// Decode without verification
function decodeToken(token) {
  return jwt.decode(token, { complete: true });
}

// HS256 is symmetric — no public key to expose via JWKS
function getJWKS() {
  return { keys: [] };
}

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  decodeToken,
  getJWKS,
};
