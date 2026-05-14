# 🤖 WhatsApp AI Chatbot — MERN + Claude AI + Twilio

An AI-powered WhatsApp chatbot built with Node.js, Express, MongoDB, and Anthropic's Claude AI, integrated via Twilio's WhatsApp API.

---

## 🏗️ Architecture

```
WhatsApp User
     ↓
Twilio WhatsApp Sandbox
     ↓  (webhook POST)
Express Server  ──→  Claude AI (generate reply)
     ↓                      ↑
MongoDB (store conversation history)
     ↓
Twilio (send reply back)
     ↓
WhatsApp User
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd whatsapp-ai-bot
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Fill in your keys (see below)
```

### 3. Get Your Keys

#### Twilio (WhatsApp Sandbox)
1. Sign up at https://twilio.com
2. Go to **Messaging → Try it out → Send a WhatsApp message**
3. Copy your **Account SID** and **Auth Token**
4. The sandbox number is: `whatsapp:+14155238886`

#### Anthropic (Claude AI)
1. Sign up at https://console.anthropic.com
2. Create an API key under **API Keys**

#### MongoDB Atlas (Free)
1. Sign up at https://mongodb.com/atlas
2. Create a free cluster
3. Get your connection string

### 4. Run the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### 5. Expose with ngrok (for local testing)

```bash
# Install ngrok: https://ngrok.com
ngrok http 5000

# You'll get a URL like:
# https://abc123.ngrok.io
```

### 6. Set Webhook in Twilio

1. Go to Twilio Console → **Messaging → Try it out → WhatsApp**
2. Set the webhook URL to:
   ```
   https://abc123.ngrok.io/webhook/whatsapp
   ```
3. Method: **HTTP POST**

### 7. Test It!

Send a WhatsApp message to **+1 415 523 8886** and join the sandbox using the code shown in your Twilio console. Your bot will reply!

---

## 📁 Project Structure

```
whatsapp-ai-bot/
├── server/
│   ├── index.js                  # Express app entry point
│   ├── routes/
│   │   ├── webhook.js            # Twilio webhook route
│   │   └── chat.js               # Dashboard API routes
│   ├── controllers/
│   │   └── webhookController.js  # Message handling logic
│   ├── models/
│   │   └── Conversation.js       # MongoDB schema
│   └── services/
│       ├── claude.js             # Claude AI integration
│       └── twilio.js             # Twilio helper
├── .env.example                  # Environment variables template
├── package.json
└── README.md
```

---

## 🎛️ Customize the Bot

Edit `BOT_SYSTEM_PROMPT` in your `.env` file:

```env
BOT_NAME=Aria
BOT_SYSTEM_PROMPT=You are Aria, a customer support assistant for Jha Tech Solutions. 
You help customers with product queries, order status, and technical support. 
Be friendly, concise, and professional.
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/whatsapp` | Twilio webhook (incoming messages) |
| GET | `/api/chat/conversations` | List all conversations |
| GET | `/api/chat/conversations/:id` | Get a specific conversation |
| GET | `/api/chat/stats` | Dashboard stats |
| GET | `/health` | Health check |

---

## 🚀 Deploy to Production

### Option 1: Railway (Recommended)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option 2: Render
1. Push to GitHub
2. Connect repo at https://render.com
3. Add environment variables
4. Deploy!

### Option 3: AWS / Azure / GCP
Use a standard Node.js deployment with PM2:
```bash
npm install -g pm2
pm2 start server/index.js --name whatsapp-bot
pm2 save
```

---

## 🔒 Going to Production (Meta Business API)

When ready to go live at scale:
1. Create a Meta Business Account
2. Apply for WhatsApp Business API access
3. Update `TWILIO_WHATSAPP_NUMBER` to your approved number
4. Or migrate directly to Meta's Cloud API (no Twilio needed)

---

## 🧩 Next Steps

- [ ] Add React dashboard to view conversations
- [ ] Add message templates (promotional messages)
- [ ] Add media support (images, documents)
- [ ] Add multi-language support
- [ ] Add analytics and reporting
