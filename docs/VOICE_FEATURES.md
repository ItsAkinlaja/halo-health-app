# Voice Features Implementation

## Overview
Implementation of three voice-related features for the onboarding experience:
1. Voice Note Input Throughout Onboarding
2. Halo's Voice Selection
3. Notification Tone Personality

---

## 1. Voice Note Input Throughout Onboarding

### Component: `VoiceInput.js`

**Purpose**: Allows users to speak their responses instead of typing during onboarding.

**Features**:
- Tap to start/stop recording
- Visual feedback (recording pulse animation)
- Processing state with loading indicator
- Automatic transcription (simulated, ready for backend integration)
- Permission handling for microphone access

**Usage**:
```jsx
import VoiceInput from '../../components/common/VoiceInput';

<VoiceInput
  onTranscript={(text) => {
    // Handle transcribed text
    console.log('User said:', text);
  }}
  placeholder="Tap to speak"
/>
```

**Integration Points**:
- Can be added to any onboarding step
- Works alongside text input fields
- Transcribed text auto-fills relevant fields

**Backend Integration Needed**:
- Audio file upload to backend
- Speech-to-text API (OpenAI Whisper, Google Speech-to-Text, or AWS Transcribe)
- AI interpretation of spoken input to extract structured data

**Example Flow**:
1. User taps microphone button
2. Records voice note: "I'm lactose intolerant and my son is allergic to peanuts"
3. Audio sent to backend for transcription
4. AI interprets: 
   - Main profile: Lactose Intolerance
   - Child profile: Peanut Allergy
5. App auto-selects these options and asks user to confirm

---

## 2. Halo's Voice Selection

### Screen: `OnboardingVoiceSelection.js`

**Purpose**: Let users choose the voice personality for Halo's audio responses.

**6 Voice Options**:

1. **Calm & Clear (Female)**
   - Warm, measured, and reassuring
   - Like a trusted health professional
   - Color: Teal (#4ECDC4)

2. **Confident & Authoritative (Male)**
   - Strong, clear, and trustworthy
   - Like a knowledgeable doctor
   - Color: Blue (#3498DB)

3. **Friendly & Upbeat (Female)**
   - Light, energetic, and encouraging
   - Like a health-conscious friend
   - Color: Orange (#F39C12)

4. **Deep & Grounding (Male)**
   - Deep, slow, and calming
   - Ideal for measured, serious delivery
   - Color: Dark Gray (#34495E)

5. **Warm & Nurturing (Female)**
   - Soft, caring, and gentle
   - Perfect for family health guidance
   - Color: Red (#E74C3C)

6. **Young & Energetic (Neutral)**
   - Bright, modern, and fast-paced
   - Perfect for quick, snappy delivery
   - Color: Purple (#9B59B6)

**Features**:
- Visual cards with icon, name, gender, description
- Sample text for each voice
- Play button to hear voice sample
- Selected state with checkmark badge
- Cannot proceed without selection

**Backend Integration Needed**:
- Store selected voice ID in user profile
- Voice synthesis API (ElevenLabs, Google TTS, AWS Polly)
- Audio sample files for each voice option

---

## 3. Notification Tone Personality

### Screen: `OnboardingNotificationTone.js`

**Purpose**: Let users choose the personality and tone for all Halo notifications.

**8 Tone Options**:

1. **Funny & Playful**
   - Humor, wit, and lighthearted language
   - Example: "🎉 Nice! You just dodged a bullet with that scan..."
   - Color: Orange (#F39C12)

2. **Motivational & Inspirational**
   - Energizing, uplifting language
   - Example: "💪 You're crushing it! Every clean swap..."
   - Color: Red (#E74C3C)

3. **Girl Talk**
   - Warm, honest, and real
   - Example: "👯 Girl, that product is a hard pass..."
   - Color: Pink (#FF69B4)

4. **You're Amazing**
   - Celebratory and affirming
   - Example: "⭐ The fact that you even care..."
   - Color: Gold (#FFD700)

5. **Doctor Level**
   - Clinical, precise, and factual
   - Example: "🔬 Analysis complete. This product contains..."
   - Color: Blue (#3498DB)

6. **Calm & Gentle**
   - Soft, non-pressuring, and supportive
   - Example: "🌿 Just a gentle reminder..."
   - Color: Teal (#4ECDC4)

7. **Straight Talker**
   - No sugarcoating, direct and honest
   - Example: "🚨 This product is garbage..."
   - Color: Orange (#E67E22)

8. **Parent Mode**
   - Nurturing, family-focused language
   - Example: "👨👩👧 This product isn't safe for your little ones..."
   - Color: Purple (#9B59B6)

**Features**:
- Visual cards with icon, name, description
- Real example notification for each tone
- Color-coded icons
- Selected state with checkmark badge
- Cannot proceed without selection

**Backend Integration**:
- Store selected tone ID in user profile
- Use tone ID to customize all notification text
- AI prompt engineering to match selected personality

---

## Updated Onboarding Flow

**New 8-Step Flow**:
1. Why Are You Here? (Goals)
2. Dietary Restrictions
3. Dietary Preferences
4. **Halo's Voice Selection** ← NEW
5. **Notification Tone Personality** ← NEW
6. Allergies
7. Health Conditions
8. Family Profiles
9. Final Setup

**Progress Indicators Updated**:
- Voice Selection: Step 4 of 8 (50%)
- Notification Tone: Step 5 of 8 (62.5%)

---

## Database Schema

### User Settings Table
```sql
ALTER TABLE user_settings ADD COLUMN halo_voice VARCHAR(50);
ALTER TABLE user_settings ADD COLUMN notification_tone VARCHAR(50);
```

Or in user_metadata:
```json
{
  "halo_voice": "calm_clear_female",
  "notification_tone": "motivational"
}
```

---

## Dependencies

### Required Package
```bash
cd frontend
npm install expo-av
```

**expo-av** provides:
- Audio recording (Audio.Recording)
- Audio playback (Audio.Sound)
- Permission handling

---

## Testing

### Voice Input
1. Tap microphone button
2. Speak a test phrase
3. Verify recording indicator shows
4. Tap to stop
5. Verify processing state
6. Check transcription callback fires

### Voice Selection
1. Navigate to voice selection screen
2. Tap play button on each voice
3. Verify audio sample plays
4. Select a voice
5. Verify checkmark appears
6. Tap continue
7. Verify selection saved

### Notification Tone
1. Navigate to notification tone screen
2. Read example for each tone
3. Select a tone
4. Verify checkmark appears
5. Tap continue
6. Verify selection saved

---

## Future Enhancements

### Voice Input
- Real-time transcription display
- Multi-language support
- Noise cancellation
- Voice command shortcuts
- "Hey Halo" wake word

### Voice Selection
- More voice options (accents, languages)
- Custom voice upload
- Voice speed control
- Pitch adjustment
- Preview with actual scan result

### Notification Tone
- Custom tone creation
- Tone mixing (combine personalities)
- Context-aware tone switching
- Time-based tone (calm at night, energetic in morning)
- Emoji density control

---

## Notes

- Voice input component is reusable across entire app
- Voice samples should be 3-5 seconds each
- Notification tone affects ALL app communications
- Settings can be changed anytime in Settings screen
- Voice selection impacts TTS API costs (consider caching)
