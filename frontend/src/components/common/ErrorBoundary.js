import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/theme';

class ErrorTracker {
  static log(error, errorInfo) {
    if (__DEV__) {
      console.warn('ErrorBoundary caught error:', error);
      console.warn('Component stack:', errorInfo?.componentStack);
    }

    // TODO: Send to Sentry in production
    // if (!__DEV__) {
    //   Sentry.captureException(error, {
    //     contexts: { react: { componentStack: errorInfo?.componentStack } },
    //   });
    // }

    try {
      const errorLog = {
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
      };
      console.warn('[ErrorTracker]', JSON.stringify(errorLog, null, 2));
    } catch (e) {
      console.warn('Failed to log error:', e);
    }
  }
}

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    ErrorTracker.log(error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Ionicons name="warning-outline" size={56} color={COLORS.primary} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          {this.state.error?.message || 'An unexpected error occurred.'}
        </Text>
        {__DEV__ && this.state.error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorText}>{this.state.error.toString()}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={this.reset}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          accessibilityHint="Attempts to recover from the error"
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.base,
  },
  title: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: COLORS.error + '10',
    padding: SPACING.base,
    borderRadius: 8,
    marginTop: SPACING.sm,
    maxWidth: '100%',
  },
  errorText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.error,
    fontFamily: 'monospace',
  },
  button: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.white,
  },
});
