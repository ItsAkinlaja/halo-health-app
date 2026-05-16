import * as Speech from 'expo-speech';

export const ttsService = {
  async getProductAudio(analysis) {
    // We don't need a blob anymore, we just return the text
    return analysis.summary || "No analysis available.";
  },

  async playAudio(textToSpeak) {
    // If it's playing, stop first
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    Speech.speak(textToSpeak, {
      language: 'en-US',
      pitch: 1.0,
      rate: 1.0,
    });
    
    // We return a dummy object to satisfy AudioPlayer expectations for 'sound'
    return {
      setOnPlaybackStatusUpdate: () => {},
      stopAsync: async () => await Speech.stop(),
      unloadAsync: async () => {},
    };
  },

  async stopAudio(sound) {
    await Speech.stop();
  },
};
