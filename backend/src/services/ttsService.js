const axios = require('axios');
const { logger } = require('../utils/logger');

class TTSService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default voice
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  async generateSpeech(text, options = {}) {
    try {
      if (!this.apiKey) {
        logger.warn('ElevenLabs API key not configured, skipping TTS');
        return null;
      }

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${options.voiceId || this.voiceId}`,
        {
          text: this.sanitizeText(text),
          model_id: options.modelId || 'eleven_monolingual_v1',
          voice_settings: {
            stability: options.stability || 0.5,
            similarity_boost: options.similarityBoost || 0.75,
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer'
        }
      );

      return {
        audio: Buffer.from(response.data),
        contentType: 'audio/mpeg'
      };
    } catch (error) {
      logger.error('Error generating speech:', error);
      throw error;
    }
  }

  async generateProductAnalysisAudio(analysis) {
    const text = this.formatProductAnalysisForSpeech(analysis);
    return this.generateSpeech(text);
  }

  async generateMenuAnalysisAudio(menuAnalysis) {
    const text = this.formatMenuAnalysisForSpeech(menuAnalysis);
    return this.generateSpeech(text);
  }

  formatProductAnalysisForSpeech(analysis) {
    let text = `Product Analysis. `;
    
    if (analysis.productName) {
      text += `${analysis.productName}. `;
    }

    if (analysis.healthScore) {
      text += `Health score: ${analysis.healthScore} out of 100. `;
    }

    if (analysis.summary) {
      text += `${analysis.summary} `;
    }

    if (analysis.concerns && analysis.concerns.length > 0) {
      text += `Concerns: ${analysis.concerns.join(', ')}. `;
    }

    if (analysis.benefits && analysis.benefits.length > 0) {
      text += `Benefits: ${analysis.benefits.join(', ')}. `;
    }

    if (analysis.recommendation) {
      text += `Recommendation: ${analysis.recommendation}`;
    }

    return text;
  }

  formatMenuAnalysisForSpeech(menuAnalysis) {
    let text = `Menu Analysis. `;

    if (menuAnalysis.restaurantName) {
      text += `${menuAnalysis.restaurantName}. `;
    }

    text += `Found ${menuAnalysis.items.length} items. `;

    const topItems = menuAnalysis.items
      .filter(item => item.analysis?.healthScore >= 70)
      .slice(0, 3);

    if (topItems.length > 0) {
      text += `Top healthy choices: `;
      topItems.forEach((item, i) => {
        text += `${i + 1}. ${item.name}, health score ${item.analysis.healthScore}. `;
      });
    }

    return text;
  }

  sanitizeText(text) {
    return text
      .replace(/[^\w\s.,!?-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // ElevenLabs limit
  }
}

module.exports = new TTSService();
