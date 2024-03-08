## ReactChatPlugin

```tsx
import React from 'react';
import { ReactChatPlugin, AiIcon, UserIcon } from 'biominer-components';

const messages = [
  {
    author: {
      id: 1,
      username: 'ChatAI',
      avatarUrl: AiIcon,
    },
    text: 'Hi, I am ChatAI, how can I help you?',
    timestamp: +new Date(),
    type: 'text',
  },
];

const disabledInputPlaceholder = 'Predicting, wait a moment...';

export default () => (
  <ReactChatPlugin
    messages={messages}
    userId={1}
    disableInput={true}
    disabledInputPlaceholder={disabledInputPlaceholder}
    showTypingIndicator={true}
    onSendMessage={() => {}}
    clearHistory={() => {
      setMessages([]);
      localStorage.setItem('chatai-messages', JSON.stringify([]));
    }}
    width={'100%'}
    height={'100%'}
  />
);
```

<API></API>
