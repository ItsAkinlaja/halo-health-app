# Accessibility Guidelines

## Overview
This document outlines accessibility best practices implemented in the Halo Health app.

## Components with Accessibility Support

### Button Component
- `accessibilityRole="button"` - Identifies as a button to screen readers
- `accessibilityLabel` - Automatically uses button title
- `accessibilityState` - Indicates disabled state
- `accessibilityHint` - Provides context when disabled

### Card Component
- `accessibilityRole="button"` - When pressable
- `accessibilityLabel` - Custom label for card content
- `accessibilityHint` - Describes what happens on press

### ErrorBoundary
- `accessibilityRole="button"` - For "Try Again" button
- `accessibilityLabel="Try again"`
- `accessibilityHint="Attempts to recover from the error"`

## Best Practices

### 1. Interactive Elements
All touchable elements should have:
```jsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Descriptive label"
  accessibilityHint="What happens when pressed"
>
```

### 2. Images
All images should have descriptive labels:
```jsx
<Image
  source={...}
  accessibilityLabel="Description of image content"
/>
```

### 3. Text Inputs
All inputs should have labels:
```jsx
<TextInput
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email to sign in"
/>
```

### 4. Loading States
Use descriptive loading indicators:
```jsx
<ActivityIndicator
  accessibilityLabel="Loading content"
/>
```

### 5. Navigation
Tab bar items should have labels:
```jsx
<Tab.Screen
  name="Home"
  options={{
    tabBarAccessibilityLabel: "Home tab",
  }}
/>
```

## Testing Accessibility

### iOS
1. Enable VoiceOver: Settings > Accessibility > VoiceOver
2. Navigate using swipe gestures
3. Double-tap to activate elements

### Android
1. Enable TalkBack: Settings > Accessibility > TalkBack
2. Navigate using swipe gestures
3. Double-tap to activate elements

## Common Issues to Avoid

1. **Missing Labels**: All interactive elements must have labels
2. **Generic Labels**: Use descriptive labels, not "Button" or "Image"
3. **Redundant Information**: Don't repeat role in label (e.g., "Submit button")
4. **Missing Hints**: Provide context for non-obvious actions
5. **Inaccessible Custom Components**: Ensure custom components support accessibility

## Future Improvements

- [ ] Add semantic headings for screen sections
- [ ] Implement focus management for modals
- [ ] Add live regions for dynamic content updates
- [ ] Support for reduced motion preferences
- [ ] High contrast mode support
- [ ] Font scaling support (already supported by React Native)

## Resources

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS Accessibility Guidelines](https://developer.apple.com/accessibility/)
- [Android Accessibility Guidelines](https://developer.android.com/guide/topics/ui/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
