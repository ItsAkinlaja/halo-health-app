import { api } from './api';
import { Audio } from 'expo-av';

export const ttsService = {
  async getProductAudio(analysis) {
    const response = await api.post('/scans/audio', {
      analysis
    }, {
      responseType: 'blob'
    });
    return response.data;
  },

  async playAudio(audioBlob) {
    const sound = new Audio.Sound();
    
    try {
      const uri = URL.createObjectURL(audioBlob);
      await sound.loadAsync({ uri });
      await sound.playAsync();
      return sound;
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  },

  async stopAudio(sound) {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  },
};
