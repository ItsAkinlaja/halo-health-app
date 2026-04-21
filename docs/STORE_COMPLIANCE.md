# iOS App Store & Google Play Store Compliance Checklist

## ✅ iOS App Store Requirements

### 1. App Information
- [x] App name: "Halo Health"
- [x] Bundle ID: com.halohealth.app
- [x] Version: 1.0.0
- [x] Build number: 1.0.0
- [ ] App Store description (512 chars max for subtitle)
- [ ] Keywords (100 chars max)
- [ ] Screenshots (required sizes: 6.5", 5.5", 12.9")
- [ ] App preview video (optional but recommended)

### 2. Privacy & Permissions
- [x] NSCameraUsageDescription - Clear explanation for camera access
- [x] NSMicrophoneUsageDescription - Clear explanation for microphone
- [x] NSPhotoLibraryUsageDescription - Photo library access
- [x] NSLocationWhenInUseUsageDescription - Location access
- [x] NSUserTrackingUsageDescription - Tracking permission (iOS 14.5+)
- [x] Privacy Policy URL required
- [x] usesNonExemptEncryption: false (no custom encryption)

### 3. App Privacy Details (Required for App Store Connect)
Must declare data collection for:
- [x] Health & Fitness data (dietary info, health conditions)
- [x] Contact Info (email, name)
- [x] User Content (product scans, meal plans)
- [x] Identifiers (user ID)
- [x] Usage Data (analytics)
- [x] Location (optional feature)

### 4. Content & Features
- [x] No hardcoded credentials in code
- [x] No placeholder content in production
- [x] Error handling for all network requests
- [x] Graceful degradation when services unavailable
- [x] No crashes or major bugs
- [x] Proper loading states
- [x] Accessibility support (VoiceOver)

### 5. Health & Medical Compliance
- [ ] Medical disclaimer (if providing health advice)
- [ ] Not claiming to diagnose, treat, or cure diseases
- [ ] Clear that app is for informational purposes
- [ ] Consult healthcare professional disclaimer

### 6. In-App Purchases (If Applicable)
- [ ] Restore purchases functionality
- [ ] Clear pricing display
- [ ] Terms of service for subscriptions
- [ ] Auto-renewal disclosure

### 7. Sign in with Apple
- [ ] Required if using third-party auth (Google, Facebook)
- [ ] Currently using email/password only - OK

### 8. App Store Assets
- [ ] App icon (1024x1024px, no transparency, no rounded corners)
- [ ] Screenshots for all device sizes
- [ ] App preview video (optional)
- [ ] Marketing materials

---

## ✅ Google Play Store Requirements

### 1. App Information
- [x] App name: "Halo Health"
- [x] Package name: com.halohealth.app
- [x] Version code: 1
- [x] Version name: 1.0.0
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Screenshots (min 2, max 8)
- [ ] Feature graphic (1024x500px)
- [ ] App icon (512x512px)

### 2. Permissions
- [x] CAMERA - Declared with clear usage
- [x] RECORD_AUDIO - Declared with clear usage
- [x] READ_EXTERNAL_STORAGE - For photo access
- [x] WRITE_EXTERNAL_STORAGE - For saving scans
- [x] ACCESS_FINE_LOCATION - Optional feature
- [x] ACCESS_COARSE_LOCATION - Optional feature

### 3. Privacy & Data Safety
Must complete Data Safety form declaring:
- [x] Data collection (health, personal info)
- [x] Data sharing practices
- [x] Data security measures
- [x] Data deletion option
- [x] Privacy policy URL

### 4. Target API Level
- [x] Target SDK 34 (Android 14) - Check package.json
- [ ] Update if needed for latest requirements

### 5. Content Rating
- [ ] Complete IARC questionnaire
- [ ] Expected rating: Everyone or Teen (health content)

### 6. App Content
- [x] No hardcoded API keys in APK
- [x] ProGuard/R8 enabled for release builds
- [x] Signed with release keystore
- [ ] Test on multiple Android versions (8.0+)

### 7. Store Listing Assets
- [ ] Feature graphic (1024x500px)
- [ ] App icon (512x512px, 32-bit PNG)
- [ ] Screenshots (min 2 per device type)
- [ ] Promo video (YouTube URL, optional)

---

## ✅ Common Requirements (Both Stores)

### 1. Legal Documents
- [x] Privacy Policy (created)
- [x] Terms of Service (in app)
- [ ] EULA (if applicable)
- [ ] Cookie Policy (if using web views)

### 2. Age Rating
- [ ] iOS: 4+ or 12+ (health content)
- [ ] Android: Everyone or Teen

### 3. Categories
- Primary: Health & Fitness
- Secondary: Food & Drink

### 4. Support
- [ ] Support email: support@halohealth.com
- [ ] Support website/FAQ
- [ ] In-app help/contact

### 5. Testing
- [ ] Test on iOS 15+ devices
- [ ] Test on Android 8.0+ devices
- [ ] Test all permissions flows
- [ ] Test offline functionality
- [ ] Test error scenarios
- [ ] Test accessibility features

### 6. Localization (Optional)
- [ ] English (default)
- [ ] Spanish
- [ ] French
- [ ] German
- [ ] Other languages

---

## ⚠️ Critical Issues to Fix Before Submission

### High Priority
1. **Medical Disclaimer**: Add disclaimer that app is for informational purposes only
2. **Data Deletion**: Implement account deletion in settings
3. **Offline Mode**: Handle network errors gracefully (already done)
4. **Rate Limiting**: Prevent API abuse
5. **Crash Reporting**: Integrate Sentry or similar

### Medium Priority
1. **Onboarding Skip**: Allow users to skip onboarding
2. **Tutorial**: Add first-time user tutorial
3. **Feedback**: In-app feedback mechanism
4. **App Rating**: Prompt for App Store/Play Store rating

### Low Priority
1. **Dark Mode**: Full dark mode support
2. **Haptic Feedback**: Add haptic feedback for actions
3. **Animations**: Polish UI animations
4. **Localization**: Multi-language support

---

## 📋 Pre-Submission Checklist

### Code Quality
- [x] No console.log in production (use __DEV__ checks)
- [x] No hardcoded URLs (use environment variables)
- [x] No test/dummy data in production
- [x] Error boundaries implemented
- [x] Loading states for all async operations

### Performance
- [ ] App launches in < 3 seconds
- [ ] Smooth 60fps scrolling
- [ ] Images optimized
- [ ] Bundle size < 50MB (iOS), < 100MB (Android)

### Security
- [x] HTTPS only for API calls
- [x] Secure token storage (Supabase handles this)
- [x] Input validation on all forms
- [x] No sensitive data in logs
- [ ] Certificate pinning (optional)

### Compliance
- [x] GDPR compliant (EU users)
- [x] CCPA compliant (California users)
- [x] COPPA compliant (no users under 13)
- [x] HIPAA awareness (not storing PHI)

---

## 🚀 Submission Process

### iOS App Store
1. Create App Store Connect account
2. Create app record
3. Upload build via Xcode or Transporter
4. Fill out app information
5. Complete privacy questionnaire
6. Submit for review (7-14 days)

### Google Play Store
1. Create Google Play Console account
2. Create app
3. Upload AAB/APK
4. Complete store listing
5. Fill out content rating
6. Complete data safety form
7. Submit for review (1-7 days)

---

## 📞 Support Contacts

- **Apple Developer Support**: https://developer.apple.com/contact/
- **Google Play Support**: https://support.google.com/googleplay/android-developer/
- **Expo Support**: https://expo.dev/support

---

## 📚 Resources

- [iOS App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
