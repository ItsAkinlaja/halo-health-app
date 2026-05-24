import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Keyboard, Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HaloMascot from '../../components/common/HaloMascot';
import { useAppContext } from '../../context/AppContext';
import { coachService } from '../../services/coachService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function AICoach({ navigation }) {
  const { user, activeProfile } = useAppContext();
  const insets = useSafeAreaInsets();
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
  const inputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const getMoodFromContent = (content) => {
    if (!content) return 'happy';
    const lower = content.toLowerCase();
    if (lower.includes('sorry') || lower.includes('error') || lower.includes('trouble') || lower.includes('failed')) return 'sad';
    if (lower.includes('caution') || lower.includes('warning') || lower.includes('careful') || lower.includes('unhealthy') || lower.includes('alert')) return 'concerned';
    if (lower.includes('great') || lower.includes('excellent') || lower.includes('perfect') || lower.includes('congratulations') || lower.includes('success')) return 'excited';
    return 'happy';
  };

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
    requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
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
      requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
    } catch (error) {
      console.warn('Failed to send message:', error.message);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    'Plan a cleaner breakfast',
    'Explain an ingredient',
    'Suggest sugar swaps',
    'Improve my weekly diet',
  ];

  const userInitial = (
    activeProfile?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    'U'
  ).charAt(0).toUpperCase();

  const showQuickPrompts = messages.length === 1 && !loading;

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    const mood = isUser ? 'happy' : getMoodFromContent(item.content);
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.mascotContainer}>
            <HaloMascot mood={mood} size={24} animated={true} />
          </View>
        )}
        <View style={[
          styles.messageBubble, 
          isUser ? styles.messageBubbleUser : styles.messageBubbleBot,
          !isUser && styles.messageBubbleBotPremium
        ]}>
          <Text style={[styles.messageText, isUser && styles.messageTextUser]}>{item.content}</Text>
        </View>
        {isUser && (
          <View style={styles.avatarUser}>
            <Text style={styles.avatarUserText}>{userInitial}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.coachIntro}>
      <View style={styles.coachIntroIcon}>
        <HaloMascot mood={sending ? 'excited' : 'happy'} size={52} animated={true} />
      </View>
      <View style={styles.coachIntroText}>
        <Text style={styles.coachIntroTitle}>Halo Coach</Text>
        <Text style={styles.coachIntroSubtitle}>
          Practical guidance for ingredients, scans, meals, and cleaner swaps.
        </Text>
      </View>
    </View>
  );

  const renderListFooter = () => {
    if (!showQuickPrompts) return <View style={styles.listBottomSpacer} />;

    return (
      <View style={styles.quickPromptsWrap}>
        <Text style={styles.quickPromptsTitle}>Start with</Text>
        <View style={styles.quickPrompts}>
          {quickPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.quickPrompt}
              onPress={() => {
                setInput(prompt);
                inputRef.current?.focus();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Halo Coach</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, sending && styles.statusDotThinking]} />
              <Text style={styles.headerSubtitle}>{sending ? 'Thinking' : 'Ready to help'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="sparkles-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Pressable style={styles.container} onPress={Keyboard.dismiss}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading conversation...</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              ListHeaderComponent={renderListHeader}
              ListFooterComponent={renderListFooter}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}
        </Pressable>

        <View style={[styles.composerDock, { paddingBottom: Math.max(insets.bottom, SPACING.sm) }]}>
          <View style={styles.inputWrap}>
            <TouchableOpacity style={styles.composerIconBtn} activeOpacity={0.8}>
              <Ionicons name="add" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about a product, meal, or ingredient"
            placeholderTextColor={COLORS.textTertiary}
            multiline
            maxLength={500}
            editable={!sending}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={() => {
              if (!input.includes('\n')) handleSend();
            }}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
            activeOpacity={0.85}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  keyboardRoot: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.base, fontWeight: '800', color: COLORS.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  statusDotThinking: { backgroundColor: COLORS.warning },
  headerSubtitle: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, fontWeight: '600' },
  container: { flex: 1 },
  messagesList: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
  },
  coachIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coachIntroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '12',
  },
  coachIntroText: { flex: 1 },
  coachIntroTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: '800', color: COLORS.textPrimary },
  coachIntroSubtitle: { marginTop: 4, fontSize: TYPOGRAPHY.sm, lineHeight: 20, color: COLORS.textSecondary },
  messageRow: {
    flexDirection: 'row',
    maxWidth: '88%',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  messageRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  mascotContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  avatarUser: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: SPACING.xs,
  },
  avatarUserText: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', color: COLORS.white },
  messageBubble: {
    flexShrink: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  messageBubbleBot: { backgroundColor: COLORS.surface },
  messageBubbleBotPremium: {
    borderWidth: 1,
    borderColor: 'rgba(0, 179, 134, 0.2)',
  },
  messageBubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: RADIUS.sm,
  },
  messageText: { fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary, lineHeight: 22 },
  messageTextUser: { color: COLORS.white },
  quickPromptsWrap: {
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.lg,
  },
  quickPromptsTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  quickPrompts: { gap: SPACING.sm },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPromptText: { flex: 1, fontSize: TYPOGRAPHY.sm, color: COLORS.textPrimary, fontWeight: '600' },
  listBottomSpacer: { height: SPACING.lg },
  composerDock: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  composerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    maxHeight: 112,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.base },
  loadingText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, fontWeight: '500', marginTop: SPACING.base },
});