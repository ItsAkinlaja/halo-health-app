const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Load keys from environment
const privateKeyPath = path.resolve(__dirname, '../../keys/private_key.pem');
const publicKeyPath = path.resolve(__dirname, '../../keys/public_key.pem');

let privateKey, publicKey;

// Load keys on startup
try {
  privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  publicKey = fs.readFileSync(publicKeyPath, 'utf8');
} catch (error) {
  console.error('Error loading JWT keys:', error);
  throw new Error('JWT keys not found. Please generate keys first.');
}

// Generate JWT token with private key
function generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') {
  return jwt.sign(payload, privateKey, {
    algorithm: process.env.JWT_ALGORITHM || 'ES256',
    expiresIn,
    keyid: process.env.JWT_KEY_ID,
  });
}

// Verify JWT token with public key
function verifyToken(token) {
  return jwt.verify(token, publicKey, {
    algorithms: [process.env.JWT_ALGORITHM || 'ES256'],
  });
}

// Generate refresh token
function generateRefreshToken(payload, expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d') {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    privateKey,
    {
      algorithm: process.env.JWT_ALGORITHM || 'ES256',
      expiresIn,
      keyid: process.env.JWT_KEY_ID,
    }
  );
}

// Decode token without verification (for getting key ID)
function decodeToken(token) {
  return jwt.decode(token, { complete: true });
}

// Get JWKS public key data
function getJWKS() {
  return {
    keys: [{
      kty: 'EC',
      crv: 'secp256k1',
      kid: process.env.JWT_KEY_ID,
      use: 'sig',
      alg: process.env.JWT_ALGORITHM || 'ES256',
      // Extract x and y coordinates from public key
      ...extractKeyCoordinates(publicKey),
    }],
  };
}

// Extract x and y coordinates from PEM public key
function extractKeyCoordinates(pemKey) {
  // Remove PEM headers and footers
  const base64Key = pemKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\n/g, '');

  // This is a simplified extraction - in production you'd want proper DER parsing
  // For now, we'll return the base64 key as the x coordinate
  return {
    x: base64Key,
    y: '', // Would need proper DER parsing to extract y coordinate
  };
}

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  decodeToken,
  getJWKS,
};
