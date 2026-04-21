const { UnauthorizedError } = require('./errorHandler');
const { supabase } = require('../utils/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = authHeader.split(' ')[1];

    // Verify via Supabase — works with both Supabase JWTs and custom JWTs
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    req.user = { id: user.id, email: user.email, ...user.user_metadata };
    next();
  } catch (error) {
    next(error instanceof UnauthorizedError ? error : new UnauthorizedError('Invalid or expired token'));
  }
};

module.exports = { authMiddleware };
