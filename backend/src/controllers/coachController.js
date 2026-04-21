const { supabase } = require('../utils/database');
const { ValidationError } = require('../middleware/errorHandler');

class CoachController {
  // POST /api/coach/chat
  async sendMessage(req, res, next) {
    try {
      const { userId, message, context } = req.body;

      if (userId !== req.user.id) {
        return res.status(403).json({ status: 'fail', message: 'Forbidden' });
      }

      if (!message?.trim()) {
        throw new ValidationError('Message is required');
      }

      // Store user message
      await supabase.from('coach_messages').insert([{
        user_id: userId,
        role: 'user',
        content: message.trim(),
      }]);

      // TODO: Call OpenAI API for response
      // For now, return a placeholder response
      const aiResponse = `I understand you're asking about: "${message.trim()}". This is a placeholder response. The OpenAI integration will be added to provide personalized health coaching based on your profile and scan history.`;

      // Store AI response
      await supabase.from('coach_messages').insert([{
        user_id: userId,
        role: 'assistant',
        content: aiResponse,
      }]);

      res.json({
        status: 'success',
        data: {
          message: aiResponse,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/coach/history
  async getChatHistory(req, res, next) {
    try {
      const { userId, limit = 50 } = req.query;

      if (userId !== req.user.id) {
        return res.status(403).json({ status: 'fail', message: 'Forbidden' });
      }

      const { data, error } = await supabase
        .from('coach_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      if (error) throw new ValidationError(error.message);

      // Reverse to get chronological order
      const messages = (data || []).reverse().map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
      }));

      res.json({ status: 'success', data: messages });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/coach/history
  async clearHistory(req, res, next) {
    try {
      const { userId } = req.query;

      if (userId !== req.user.id) {
        return res.status(403).json({ status: 'fail', message: 'Forbidden' });
      }

      const { error } = await supabase
        .from('coach_messages')
        .delete()
        .eq('user_id', userId);

      if (error) throw new ValidationError(error.message);

      res.json({ status: 'success', message: 'Chat history cleared' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CoachController();
