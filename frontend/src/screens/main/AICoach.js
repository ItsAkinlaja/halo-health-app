import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HaloMascot from '../../components/common/HaloMascot';
import { useAppContext } from '../../context/AppContext';
import { coachService } from '../../services/coachService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function AICoach({ navigation }) {
  const { user, activeProfile } = useAppContext();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m Halo, your personal health coach. I can help you understand product ingredients, suggest healthier alternatives, answer nutrition questions, and provide personalized health guidance. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const history = await coachService.getChatHistory(user.id, 20);
      if (history && history.length > 0) {
        setMessages((prev) => [...prev, ...history]);
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await coachService.sendMessage(user.id, userMessage.content, {
        profileId: activeProfile?.id,
        profileName: activeProfile?.name,
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message || 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.warn('Failed to send message:', error.message);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    'What are the healthiest breakfast options?',
    'Explain this ingredient to me',
    'Suggest alternatives for sugar',
    'How can I improve my diet?',
  ];

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.mascotContainer}>
            <HaloMascot mood="happy" size={32} animated={false} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleBot]}>
          <Text style={[styles.messageText, isUser && styles.messageTextUser]}>{item.content}</Text>
        </View>
        {isUser && (
          <View style={styles.avatarUser}>
            <Text style={styles.avatarUserText}>
              {user?.user_metadata?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerMascot}>
            <HaloMascot mood="happy" size={36} animated={true} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Halo Coach</Text>
            <Text style={styles.headerSubtitle}>AI Health Assistant</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading conversation...</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />

            {messages.length === 1 && (
              <View style={styles.quickPromptsWrap}>
                <Text style={styles.quickPromptsTitle}>Quick questions:</Text>
                <View style={styles.quickPrompts}>
                  {quickPrompts.map((prompt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.quickPrompt}
                      onPress={() => setInput(prompt)}
                    >
                      <Text style={styles.quickPromptText}>{prompt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Halo anything..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerMascot: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary },
  menuBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1 },
  messagesList: { padding: SPACING.base },
  messageRow: { flexDirection: 'row', maxWidth: '85%', marginBottom: SPACING.md, alignItems: 'flex-end' },
  messageRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  mascotContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginBottom: 4,
  },
  avatarUser: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: SPACING.sm,
  },
  avatarUserText: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', color: COLORS.white },
  messageBubble: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.lg },
  messageBubbleBot: { backgroundColor: COLORS.surface },
  messageBubbleUser: { backgroundColor: COLORS.primary },
  messageText: { fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary, lineHeight: 22 },
  messageTextUser: { color: COLORS.white },
  quickPromptsWrap: { padding: SPACING.base },
  quickPromptsTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  quickPrompts: {},
  quickPrompt: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  quickPromptText: { fontSize: TYPOGRAPHY.sm, color: COLORS.textPrimary },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.base,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.base },
  loadingText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, fontWeight: '500', marginTop: SPACING.base },
});
