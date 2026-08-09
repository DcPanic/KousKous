/**
 * Direct messages (spec §7 screen 9).
 *
 * Conversations are one-to-one for now; group chats belong to events and
 * are a separate surface.
 */

import type { Attachment } from './forum';

export interface ChatMessage {
  id: string;
  /** True when the signed-in user wrote it. */
  mine: boolean;
  body: string;
  time: string;
  attachments: Attachment[];
}

export interface Conversation {
  id: string;
  name: string;
  verified: boolean;
  /** Place id, shown under the name for context. */
  location: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}

export const conversations: Conversation[] = [
  {
    id: 'c1',
    name: 'Ελένη Κ.',
    verified: false,
    location: 'athens',
    lastMessage: 'Τέλεια, τα λέμε το Σάββατο! 🍷',
    lastTime: '10:42',
    unread: 2,
    online: true,
    messages: [
      {
        id: 'c1m1',
        mine: false,
        body: 'Είδα ότι δήλωσες κι εσύ στο Wine Night!',
        time: '10:30',
        attachments: [],
      },
      {
        id: 'c1m2',
        mine: true,
        body: 'Ναι! Πρώτη φορά πάω σε event του KousKous, λίγο άγχος 😅',
        time: '10:34',
        attachments: [],
      },
      {
        id: 'c1m3',
        mine: false,
        body: 'Μην αγχώνεσαι καθόλου, όλες έτσι ξεκινήσαμε. Θα κάτσουμε μαζί.',
        time: '10:40',
        attachments: [],
      },
      {
        id: 'c1m4',
        mine: false,
        body: 'Τέλεια, τα λέμε το Σάββατο! 🍷',
        time: '10:42',
        attachments: [],
      },
    ],
  },
  {
    id: 'c2',
    name: 'Μαρία Π.',
    verified: true,
    location: 'thessaloniki',
    lastMessage: 'Σου στέλνω φωτογραφία από το μέρος',
    lastTime: 'Χθες',
    unread: 0,
    online: false,
    messages: [
      {
        id: 'c2m1',
        mine: true,
        body: 'Πού ήταν αυτό το brunch που έγραψες;',
        time: 'Χθες 18:02',
        attachments: [],
      },
      {
        id: 'c2m2',
        mine: false,
        body: 'Σου στέλνω φωτογραφία από το μέρος',
        time: 'Χθες 18:15',
        attachments: [{ id: 'c2a1', kind: 'image', tint: '#F0E4D8' }],
      },
    ],
  },
  {
    id: 'c3',
    name: 'Νατάσα Ιωάννου',
    verified: true,
    location: 'athens',
    lastMessage: 'Καλησπέρα! Ναι, υπάρχουν ακόμα θέσεις.',
    lastTime: 'Δευ',
    unread: 0,
    online: false,
    messages: [
      {
        id: 'c3m1',
        mine: true,
        body: 'Καλησπέρα, υπάρχουν θέσεις για την πρωινή yoga;',
        time: 'Δευ 09:12',
        attachments: [],
      },
      {
        id: 'c3m2',
        mine: false,
        body: 'Καλησπέρα! Ναι, υπάρχουν ακόμα θέσεις.',
        time: 'Δευ 09:30',
        attachments: [],
      },
    ],
  },
];

export function findConversation(id: string): Conversation | undefined {
  return conversations.find((conversation) => conversation.id === id);
}

export const totalUnread = conversations.reduce(
  (sum, conversation) => sum + conversation.unread,
  0,
);
