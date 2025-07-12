const axios = require("axios");

const blockedWords = [
  "fuck", "shit", "bitch", "asshole", "slut", "cunt", "retard", "dick", "porn", "rape", "nigger"
];

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    const content = message.content.toLowerCase();

    // Quick check for slurs or obvious words
    const keywordFlagged = blockedWords.some(word => content.includes(word));
    if (!keywordFlagged) return;

    // Deep AI check (fallback-friendly)
    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "nousresearch/nous-capybara-7b:free",
          messages: [{
            role: "user",
            content: `Is the following Discord message toxic or abusive?\n\n"${message.content}"\n\nJust reply Yes or No.`
          }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://zex-auto.onrender.com",
            "X-Title": "ZEX-AUTO+"
          }
        }
      );

      const aiResponse = res.data.choices?.[0]?.message?.content?.toLowerCase().trim();

      if (aiResponse?.includes("yes")) {
        await message.delete();
        await message.channel.send(`⚠️ <@${message.author.id}> message deleted for violating rules.`);
        console.log(`💥 Auto-deleted: ${message.content}`);
      } else {
        console.log("✅ AI passed the message.");
      }
    } catch (err) {
      console.error("AI moderation failed:", err?.response?.data || err.message);
      // Fallback to basic keyword delete
      try {
        await message.delete();
        await message.channel.send(`⚠️ <@${message.author.id}> your message contained banned words.`);
        console.log("🚨 Deleted via fallback.");
      } catch (delErr) {
        console.error("Fallback deletion failed:", delErr);
      }
    }
  });
};