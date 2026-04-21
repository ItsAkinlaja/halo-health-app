# Error Tracking Setup

## Overview
The app includes an ErrorTracker service that logs errors with structured data. Currently logs to console, but can be integrated with services like Sentry, Bugsnag, or LogRocket.

## Current Implementation

### ErrorBoundary with ErrorTracker
Located in: `frontend/src/components/common/ErrorBoundary.js`

The ErrorTracker logs:
- Error message and stack trace
- Component stack trace
- Timestamp
- Environment (dev/production)

### Development Mode
- Errors logged to console with full details
- Error details displayed in UI for debugging

### Production Mode (TODO)
Ready for integration with error tracking services.

## Integrating Sentry

### 1. Install Sentry
```bash
cd frontend
npm install @sentry/react-native
npx @sentry/wizard -i reactNative -p ios android
```

### 2. Initialize Sentry
In `App.js`:
```javascript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  enableInExpoDevelopment: false,
  debug: __DEV__,
});
```

### 3. Update ErrorTracker
In `ErrorBoundary.js`, uncomment the Sentry code:
```javascript
if (!__DEV__) {
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo?.componentStack,
      },
    },
  });
}
```

### 4. Add User Context
```javascript
Sentry.setUser({
  id: user.id,
  email: user.email,
});
```

### 5. Add Breadcrumbs
```javascript
Sentry.addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to MealPlanner',
  level: 'info',
});
```

## Alternative Services

### Bugsnag
```bash
npm install @bugsnag/react-native
```

### LogRocket
```bash
npm install logrocket logrocket-react
```

### Firebase Crashlytics
```bash
npm install @react-native-firebase/crashlytics
```

## Error Logging Best Practices

### 1. Log Contextual Information
```javascript
ErrorTracker.log(error, {
  userId: user.id,
  screen: 'MealPlanner',
  action: 'generateMealPlan',
  timestamp: new Date().toISOString(),
});
```

### 2. Set Error Severity
```javascript
// Critical errors
Sentry.captureException(error, { level: 'fatal' });

// Warnings
Sentry.captureException(error, { level: 'warning' });
```

### 3. Add Custom Tags
```javascript
Sentry.setTag('feature', 'meal-planning');
Sentry.setTag('api_version', 'v1');
```

### 4. Filter Sensitive Data
```javascript
Sentry.init({
  beforeSend(event) {
    // Remove sensitive data
    if (event.user) {
      delete event.user.email;
    }
    return event;
  },
});
```

## Monitoring API Errors

Add error tracking to API client in `frontend/src/services/api.js`:

```javascript
async request(endpoint, options = {}) {
  try {
    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = new Error(`API Error: ${response.status}`);
      error.endpoint = endpoint;
      error.statusCode = response.status;
      
      if (!__DEV__) {
        Sentry.captureException(error, {
          tags: {
            endpoint,
            statusCode: response.status,
          },
        });
      }
      
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    // Log network errors
    if (!__DEV__) {
      Sentry.captureException(error);
    }
    throw error;
  }
}
```

## Performance Monitoring

### Sentry Performance
```javascript
const transaction = Sentry.startTransaction({
  name: 'Generate Meal Plan',
  op: 'meal.generate',
});

try {
  await mealService.generateMealPlan(profileId, preferences);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('error');
  throw error;
} finally {
  transaction.finish();
}
```

## Testing Error Tracking

### Trigger Test Error
```javascript
// Add to a test button
<Button
  title="Test Error"
  onPress={() => {
    throw new Error('Test error for tracking');
  }}
/>
```

### Verify in Sentry Dashboard
1. Check Issues tab for new errors
2. Verify error details and stack trace
3. Confirm user context is attached
4. Check breadcrumbs for user actions

## Cost Considerations

### Sentry Free Tier
- 5,000 errors/month
- 10,000 performance units/month
- 30-day retention

### Paid Plans
- Start at $26/month
- Increased quotas
- Longer retention
- Advanced features

## Privacy & Compliance

1. **GDPR Compliance**: Configure data scrubbing
2. **User Consent**: Inform users about error tracking
3. **Data Retention**: Set appropriate retention periods
4. **PII Removal**: Filter personal information before sending

## Next Steps

1. Choose error tracking service
2. Install and configure SDK
3. Update ErrorTracker in ErrorBoundary
4. Add API error tracking
5. Test in staging environment
6. Monitor error rates in production
