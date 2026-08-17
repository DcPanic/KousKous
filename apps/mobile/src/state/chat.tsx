import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Attachment } from '@/data/forum';
import { conversations as seededConversations } from '@/data/chat';
import {
  fetchConversations,
  fetchMessages,
  markRead,
  openConversationWith,
  sendMessage as writeMessage,
  type ChatMessage,
  type Conversation,
} from '@/lib/chat-repo';
import { useSession } from '@/state/session';

/**
 * Direct messages.
 *
 * Open to every account, paid or not. Signed out, the seeded
 * conversations stand in so the inbox is not an empty box in the preview.
 */

interface ChatValue {
  conversations: Conversation[];
  loading: boolean;
  refresh: () => Promise<void>;

  messagesFor: (conversationId: string) => ChatMessage[];
  loadMessages: (conversationId: string) => Promise<void>;
  /** Returns false when the message could not be sent. */
  send: (conversationId: string, body: string, attachment?: Attachment) => Promise<boolean>;

  /** Opens — or starts — the conversation with one woman. */
  openWith: (otherId: string) => Promise<string | null>;

  markConversationRead: (conversationId: string) => void;
  unreadCount: number;
}

const ChatContext = createContext<ChatValue | null>(null);

/** The seeded messages, so opening a preview conversation shows one. */
const PREVIEW_MESSAGES: Record<string, ChatMessage[]> = Object.fromEntries(
  seededConversations.map((conversation) => [
    conversation.id,
    conversation.messages.map((message) => ({
      id: message.id,
      mine: message.mine,
      body: message.body,
      time: message.time,
      createdAt: '',
      attachments: message.attachments,
    })),
  ]),
);

/** The seeded inbox, widened to the shape the real one uses. */
const PREVIEW: Conversation[] = seededConversations.map((conversation) => ({
  id: conversation.id,
  personId: '',
  name: conversation.name,
  verified: conversation.verified,
  avatarUrl: null,
  location: conversation.location,
  lastMessage: conversation.lastMessage,
  lastTime: conversation.lastTime,
  unread: conversation.unread,
}));

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, signedIn, ready } = useSession();

  const [remote, setRemote] = useState<Conversation[] | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  // Cleared on refresh: once the mark is written, the count comes back
  // from the database and this is no longer needed.
  const [readLocally, setReadLocally] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!signedIn) return;

    setLoading(true);

    try {
      setRemote(await fetchConversations(user.id));
      setReadLocally([]);
    } catch {
      // Keep the inbox as it was rather than emptying it.
    } finally {
      setLoading(false);
    }
  }, [signedIn, user.id]);

  useEffect(() => {
    if (!ready) return;

    if (signedIn) {
      void refresh();
    } else {
      setRemote(null);
      setMessages({});
      setReadLocally([]);
    }
  }, [ready, signedIn, refresh]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!signedIn) return;

      try {
        const loaded = await fetchMessages(conversationId, user.id);
        setMessages((prev) => ({ ...prev, [conversationId]: loaded }));
      } catch {
        // Leave whatever is on screen.
      }
    },
    [signedIn, user.id],
  );

  const send = useCallback(
    async (conversationId: string, body: string, attachment?: Attachment) => {
      if (!signedIn) return false;

      try {
        await writeMessage(conversationId, user.id, body, attachment);
        await loadMessages(conversationId);
        void refresh();
        return true;
      } catch {
        return false;
      }
    },
    [signedIn, user.id, loadMessages, refresh],
  );

  const openWith = useCallback(
    async (otherId: string) => {
      if (!signedIn) return null;

      const id = await openConversationWith(user.id, otherId);
      if (id) void refresh();
      return id;
    },
    [signedIn, user.id, refresh],
  );

  const markConversationRead = useCallback(
    (conversationId: string) => {
      // Cleared on screen straight away; the write follows.
      setReadLocally((prev) =>
        prev.includes(conversationId) ? prev : [conversationId, ...prev],
      );

      if (signedIn) void markRead(conversationId, user.id);
    },
    [signedIn, user.id],
  );

  const value = useMemo<ChatValue>(() => {
    const list = (remote ?? PREVIEW).map((conversation) =>
      readLocally.includes(conversation.id) ? { ...conversation, unread: 0 } : conversation,
    );

    return {
      conversations: list,
      loading,
      refresh,
      messagesFor: (conversationId: string) =>
        messages[conversationId] ?? (remote ? [] : (PREVIEW_MESSAGES[conversationId] ?? [])),
      loadMessages,
      send,
      openWith,
      markConversationRead,
      unreadCount: list.reduce((total, conversation) => total + conversation.unread, 0),
    };
  }, [remote, readLocally, loading, refresh, messages, loadMessages, send, openWith, markConversationRead]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatValue {
  const value = useContext(ChatContext);
  if (!value) throw new Error('useChat must be used inside a ChatProvider');
  return value;
}
