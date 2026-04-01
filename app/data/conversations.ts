export type Message = {
  id: string;
  content: string;
  sender: 'me' | 'them';
  timestamp: string;
};

export type Conversation = {
  id: string;
  name: string;
  initials: string;
  color: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
};

export const initialConversations: Conversation[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    initials: 'AJ',
    color: 'bg-violet-500',
    lastMessage: 'Sounds good! See you tomorrow.',
    time: '10:42 AM',
    unread: 2,
    online: true,
    messages: [
      { id: 'm1', content: 'Hey! Are you free tomorrow?', sender: 'them', timestamp: '10:30 AM' },
      { id: 'm2', content: 'Yeah, what time works for you?', sender: 'me', timestamp: '10:35 AM' },
      { id: 'm3', content: 'How about 2 PM at the coffee shop?', sender: 'them', timestamp: '10:40 AM' },
      { id: 'm4', content: 'Sounds good! See you tomorrow.', sender: 'them', timestamp: '10:42 AM' },
    ],
  },
  {
    id: '2',
    name: 'Bob Martinez',
    initials: 'BM',
    color: 'bg-emerald-500',
    lastMessage: 'Can you review my PR when you get a chance?',
    time: '9:15 AM',
    unread: 1,
    online: true,
    messages: [
      { id: 'm1', content: 'Morning! Just pushed the new feature branch.', sender: 'them', timestamp: '9:00 AM' },
      { id: 'm2', content: 'Nice, how is it going?', sender: 'me', timestamp: '9:10 AM' },
      { id: 'm3', content: 'Can you review my PR when you get a chance?', sender: 'them', timestamp: '9:15 AM' },
    ],
  },
  {
    id: '3',
    name: 'Design Team',
    initials: 'DT',
    color: 'bg-orange-500',
    lastMessage: 'Mockups are ready for review',
    time: 'Yesterday',
    unread: 0,
    online: false,
    messages: [
      { id: 'm1', content: 'Hi team! Sharing the new mockups for the dashboard redesign.', sender: 'them', timestamp: 'Yesterday 3:00 PM' },
      { id: 'm2', content: 'Mockups are ready for review', sender: 'them', timestamp: 'Yesterday 3:05 PM' },
      { id: 'm3', content: 'These look fantastic! The color palette is much better. Approving!', sender: 'me', timestamp: 'Yesterday 4:00 PM' },
    ],
  },
  {
    id: '4',
    name: 'Carol White',
    initials: 'CW',
    color: 'bg-pink-500',
    lastMessage: 'Thanks so much for your help!',
    time: 'Yesterday',
    unread: 0,
    online: false,
    messages: [
      { id: 'm1', content: 'Hey, could you help me debug something?', sender: 'them', timestamp: 'Yesterday 1:00 PM' },
      { id: 'm2', content: 'Sure! What is the issue?', sender: 'me', timestamp: 'Yesterday 1:05 PM' },
      { id: 'm3', content: 'The login form keeps resetting after submission.', sender: 'them', timestamp: 'Yesterday 1:10 PM' },
      { id: 'm4', content: "Check if the form's onSubmit is calling e.preventDefault(). Also make sure state isn't being reset by a parent re-render.", sender: 'me', timestamp: 'Yesterday 1:15 PM' },
      { id: 'm5', content: 'That was it! preventDefault fixed it immediately.', sender: 'them', timestamp: 'Yesterday 1:18 PM' },
      { id: 'm6', content: 'Thanks so much for your help!', sender: 'them', timestamp: 'Yesterday 1:20 PM' },
    ],
  },
  {
    id: '5',
    name: 'Dev Team',
    initials: 'DV',
    color: 'bg-blue-500',
    lastMessage: 'Sprint planning moved to 3:30 PM',
    time: 'Mon',
    unread: 0,
    online: false,
    messages: [
      { id: 'm1', content: 'Reminder: standup in 10 minutes!', sender: 'them', timestamp: 'Mon 9:50 AM' },
      { id: 'm2', content: 'On my way', sender: 'me', timestamp: 'Mon 9:52 AM' },
      { id: 'm3', content: 'Sprint planning moved to 3:30 PM — meeting room B is booked for the original slot.', sender: 'them', timestamp: 'Mon 11:00 AM' },
      { id: 'm4', content: 'Got it, thanks for the heads up!', sender: 'me', timestamp: 'Mon 11:05 AM' },
    ],
  },
];
