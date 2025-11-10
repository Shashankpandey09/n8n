// nodeCatalog.ts
export const nodeCatalog = [
  { 
    type: 'webhook', 
    category: 'Trigger', 
    parameters: [
      { name: 'method', type: 'string', default: 'POST', required: true }
    ] 
  },
  { 
    type: 'telegram', 
    category: 'Action', 
    parameters: [
      { name: 'chatId', type: 'string', required: true },
      { name: 'text', type: 'string', required: true }
    ], 
    credentials: [{ name: 'telegram', required: true }] 
  },
  { 
    type: 'smtp', 
    category: 'Action', 
    parameters: [
      { name: 'to', type: 'string', required: true },
      { name: 'subject', type: 'string', required: false, default: '' },
      { name: 'body', type: 'string', required: true },
    ], 
    credentials: [{ name: 'smtp', required: true }] 
  },
  { 
    type: 'discord', 
    category: 'Action', 
    parameters: [
      { name: 'WebhookUrl', type: 'string', required: true }, // The URL for the Discord webhook
      { name: 'message', type: 'string', required: true }      // The message to send
    ],
    // Note: For Discord webhooks, the URL itself is the secret,
    // so it's treated as a parameter rather than a separate credential.
  }
];