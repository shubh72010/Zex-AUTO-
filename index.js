// index.js
const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const automod = require('./automod');

const app = express();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ✅ Bot ready
client.once('ready', () => {
  console.log(`🤖 ZEX AUTO+ is online as ${client.user.tag}`);
});

// 🧠 AI mention response
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  // Handle AI mentions
  if (message.mentions.has(client.user)) {
    const prompt = message.content;

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "tngtech/deepseek-r1t2-chimera:free",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://zexauto.dortz.zone",
            "X-Title": "ZEX-AUTO+",
          },
        }
      );

      const reply = response.data.choices?.[0]?.message?.content;
      message.reply(reply || "🤖 I'm thinking too hard...");
    } catch (err) {
      console.error("AI error:", err);
      message.reply("⚠️ I forgot how to think.");
    }
  }

  // 👮‍♂️ Run automod checks
  automod(message);
});

// 🌐 Health check
app.get('/', (_, res) => res.send('ZEX AUTO+ alive'));
app.listen(3000, () => console.log('🌐 Express live at port 3000'));

client.login(process.env.TOKEN);