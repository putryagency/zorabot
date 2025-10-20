import fetch from "node-fetch";

// ==============================================
// 🚀 ZORA NEW CREATOR LISTING BOT (REALTIME AUTO POST)
// Deploy on Vercel Edge Function
// Fetches new creators from Zora GraphQL instantly
// Posts to Telegram channel with button links
// ==============================================

export const config = {
  runtime: "edge",
};

// === Environment Variables ===
const ZORA_URL =
  process.env.ZORA_GRAPHQL_URL || "https://api.zora.co/universal/graphql";
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

let lastSeen = new Set(); // temporary in-memory cache

// === Fetch New Creators from Zora GraphQL ===
async function fetchNewCreators() {
  const body = {
    hash: "c2b3a1f16014905782a54053dc5a0aa4",
    operationName: "TabsQueriesProvider_ExploreQuery",
    variables: { first: 10, listType: "NEW_CREATORS" },
  };

  const res = await fetch(ZORA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  return json?.data?.universal?.list?.edges || [];
}

// === Send Creator Info to Telegram ===
async function postToTelegram(creator) {
  const node = creator.node;
  const handle = node?.creatorProfile?.handle || node?.name;
  const displayName = node?.creatorProfile?.displayName || handle;
  const photo = node?.mediaContent?.downloadableUri;
  const twitter = node?.creatorProfile?.socialAccounts?.twitter?.username;
  const farcaster = node?.creatorProfile?.socialAccounts?.farcaster?.username;
  const tiktok = node?.creatorProfile?.socialAccounts?.tiktok?.username;
  const instagram = node?.creatorProfile?.socialAccounts?.instagram?.username;
  const contract = node?.address;
  const marketCap = Number(node?.marketCap || 0).toFixed(2);
  const holders = node?.uniqueHolders || 0;
  const created = new Date(node?.createdAt).toLocaleString("en-US", {
    timeZone: "UTC",
  });

  const caption = `🆕 *New Creator on ZORA!*\n
👤 *${displayName}* (@${handle})
💰 MarketCap: ${marketCap}
📈 Holders: ${holders}
📅 Created: ${created}

🌐 Socials:
${twitter ? `🐦 Twitter: https://twitter.com/${twitter}\n` : ""}
${instagram ? `📸 Instagram: https://instagram.com/${instagram}\n` : ""}
${farcaster ? `🌌 Farcaster: https://warpcast.com/${farcaster}\n` : ""}
${tiktok ? `🎵 TikTok: https://tiktok.com/@${tiktok}\n` : ""}

🔗 Contract: \`${contract}\`
`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "💸 Trade Now",
          url: `https://your-trade-link.com/${handle}`,
        },
        {
          text: "🔍 View Contract",
          url: `https://basescan.org/address/${contract}`,
        },
      ],
    ],
  };

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      photo,
      caption,
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }),
  });
}

// === Process New Creators & Post to Telegram ===
async function processCreators() {
  const creators = await fetchNewCreators();

  for (const c of creators) {
    const addr = c.node.address;
    if (!lastSeen.has(addr)) {
      lastSeen.add(addr);
      await postToTelegram(c);
    }
  }
}

// === Main Handler ===
export default async function handler(req) {
  await processCreators();
  return new Response(JSON.stringify({ ok: true, time: new Date().toISOString() }), {
    headers: { "Content-Type": "application/json" },
  });
}
