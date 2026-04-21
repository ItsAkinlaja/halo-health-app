const express = require('express');
const { getJWKS } = require('../utils/jwt');

const router = express.Router();

// JWKS endpoint for public key distribution
router.get('/.well-known/jwks.json', (req, res) => {
  try {
    const jwks = getJWKS();
    res.json(jwks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve JWKS' });
  }
});

module.exports = router;
