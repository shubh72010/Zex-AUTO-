const axios = require("axios");

const flaggedWords = [
  "fuck", "shit", "bitch", "asshole", "slut", "cunt", "retard", "dick", "porn", "rape", "nigger"
];

function isFlagged(message) {
  return flaggedWords.some(word => message.content.toLowerCase().includes(word));
}

async function analyzeMessage(content) {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "nousresearch/nous-capybara-7b:free", // 🚀 Fastest free model on OpenRouter
        messages: [{
          role: "user",
          content: `Is the following message toxic?\n\n"${content}"\n\nReply with only one word: "Yes" or "No".`
        }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://zex-auto.dortz.zone",
          "X-Title": "ZEX-AUTO+"
        }
      }
    );

    return response.data.choices?.[0]?.message?.content?.trim();
  } catch (err) {
    console.error("🧠 AI Error:", err?.response?.data || err.message);
    return null;
  }
}

module.exports = (client) => {
  client.on("messageCreate", async (msg) => {
    if (msg.author.bot || !msg.guild) return;

    if (!isFlagged(msg)) return;

    const result = await analyzeMessage(msg.content);

    if (!result) return;

    if (result.toLowerCase().includes("yes")) {
      try {
        await msg.delete();
        await msg.channel.send(`⚠️ <@${msg.author.id}> that message was flagged as toxic and removed.`);
        console.log(`🚨 Deleted: "${msg.content}"`);
      } catch (err) {
        console.error("❌ Couldn't delete message:", err);
      }
    }
  });
};