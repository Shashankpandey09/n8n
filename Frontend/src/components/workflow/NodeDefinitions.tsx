import { Webhook, Send, Database, GitBranch, Zap } from "lucide-react";


const nodeDefinitions = [
  { 
    type: 'webhook', 
    category: 'Trigger', 
    icon: Webhook,
    label: "Webhook",
    description: "Trigger from HTTP request",
    parameters: [
      { name: 'method', label: 'HTTP Method', type: 'string', default: 'POST', required: true },
      
    ] 
  },
  { 
    type: 'telegram', 
    category: 'Action', 
    icon: Send,
    label: "Telegram",
    description: "Send a message",
    parameters: [
      { name: 'chatId', label: 'Chat ID', type: 'string', required: true, placeholder: '@username or chat_id' },
      { name: 'text', label: 'Message Text', type: 'string', required: true, placeholder: 'Your message...' }
    ], 
    credentials: [{ name:'telegram', required:true,InputFields:null }] 
  },
  { 
    type: 'smtp', 
    category: 'Action', 
    icon: Send,
    label: "SMTP",
    description:[ "Send an email","Send&wait"],
    parameters: [
      { name: 'to', label: 'To', type: 'string', required: true, placeholder: 'recipient@example.com' },
        { name: 'from', label: 'from', type: 'string', required: true, placeholder: 'recipient@example.com' },
      { name: 'subject', label: 'Subject', type: 'string', required: false, default: '' },
      { name: 'body', label: 'Body', type: 'string', required: true },
    ], 
   credentials: [{ name:'smtp', required:true ,InputFields:[{
      name:'EMAIL_USER',type:'input'
    },{
      name:'EMAIL_PASS',
      type:'password'
    }] }] 
  },
  //    { 
  //   type: 'smtp', 
  //   category: 'Action', 
  //   icon: Send,
  //   label: "SMTP",
  //   description: "",
  //   parameters: [
  //     { name: 'to', label: 'To', type: 'string', required: true, placeholder: 'recipient@example.com' },
  //     { name: 'subject', label: 'Subject', type: 'string', required: false, default: '' },
  //     { name: 'body', label: 'Body', type: 'string', required: true },
  //   ], 
  //   credentials: [{ name:'smtp', required:true ,InputFields:[{
  //     name:'EMAIL_USER'
  //   },{
  //     name:'EMAIL_PASS'
  //   }] }] 
  // },
  { 
    type: 'discord', 
    category: 'Action',
    icon: Send, 
    label: "Discord", 
    description: "Send message",
    parameters: [
      { name: 'WebhookUrl', label: 'Discord Webhook URL', type: 'string', required: true, placeholder: 'Enter Discord Webhook URL' },
      { name: 'message', label: 'Message', type: 'string', required: true, placeholder: 'Your message text' }
    ]
  },
  { 
    type: 'http', 
    category: 'Action', 
    icon: Zap, 
    label: "HTTP Request", 
    description: "Make API call",
    parameters: [
      { name: 'url', label: 'URL', type: 'string', required: true, placeholder: 'https://api.example.com' },
      { name: 'httpMethod', label: 'Method', type: 'string', default: 'GET', required: true }
    ]
  },
  // { 
  //   type: "database",
  //   category: 'Action',
  //   icon: Database,
  //   label: "Database",
  //   description: "Query database",
  //   parameters: [] // No parameters by default
  // },
  // { 
  //   type: "condition",
  //   category: 'Action',
  //   icon: GitBranch,
  //   label: "Condition",
  //   description: "Branch logic",
  //   parameters: [] // No parameters by default
  // },

];

export default nodeDefinitions;