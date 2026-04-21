# Installation Instructions

## Missing Dependencies

The following packages need to be installed for full functionality:

### Required Packages

```bash
cd frontend
npm install expo-image-picker expo-av
```

### Package Details

1. **expo-image-picker** - Required for:
   - Restaurant menu scanning
   - Photo uploads for product scanning
   - Profile picture uploads

2. **expo-av** - Required for:
   - Audio playback ("Listen to Results" feature)
   - Voice interface features

### After Installation

1. Restart the development server:
   ```bash
   npm start
   ```

2. Clear cache if needed:
   ```bash
   npm start -- --clear
   ```

### Features Enabled After Installation

✅ Restaurant Menu Scanner
✅ Audio Playback for scan results
✅ Photo scanning for ingredients
✅ Profile picture uploads

### Temporary Workaround

Until packages are installed, the RestaurantMenuScanner screen will show installation instructions instead of crashing the app.
