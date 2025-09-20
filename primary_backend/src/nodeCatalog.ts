// nodeCatalog.ts
export const nodeCatalog = [
  { type: 'webhook', category: 'Trigger', parameters: [{ name: 'method', type: 'string', default: 'POST' ,required:true}] },

  { type: 'telegram_send', category: 'Action', parameters: [
      { name: 'chatId', type: 'string', required: true },
      { name: 'text', type: 'string', required: true }
    ], credentials: [{name:'telegram',required:true}] },

  { type: 'email_send', category: 'Action', parameters: [
      { name: 'to', type: 'string', required: true },
      { name: 'subject', type: 'string', required: false, default: '' },
      { name: 'body', type: 'string', required: true },
     
    ], credentials: [{name:'smtp',required:true}] }
];
