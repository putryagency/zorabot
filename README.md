# 🤖 Zora New Creator Listing Bot

Bot otomatis yang memantau API Zora untuk *NEW_CREATORS*  
dan memposting langsung ke Telegram channel secara real-time  
tanpa VPS, langsung di Vercel Edge Functions.

---

### 🚀 Fitur:
- Auto post setiap ada new creator baru
- Menampilkan nama, foto, contract, dan sosial media
- Tombol “💸 Trade Now” dan “🔍 View Contract”
- Full serverless: hanya pakai Vercel
- Realtime, tanpa delay

---

### 🧩 Environment Variables
Tambahkan di **Vercel Dashboard → Settings → Environment Variables**:
- `TELEGRAM_BOT_TOKEN` → Token dari BotFather
- `TELEGRAM_CHANNEL_ID` → Contoh: `@zoramonitor` atau `-1001234567890`
- `ZORA_GRAPHQL_URL` → `https://api.zora.co/universal/graphql`

---

### 🛠️ Cara Deploy

1. **Buat project baru di folder lokal**
   ```bash
   mkdir zora-listing-bot
   cd zora-listing-bot
