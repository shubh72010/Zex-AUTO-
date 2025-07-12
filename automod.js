const axios = require('axios');

module.exports = function automod(client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const rawMessage = message.content.toLowerCase();
    const bannedWords = ['fuck', 'shit', 'bitch', 'slut', 'dick', 'nigga', 'nigger', 'cunt', 'whore', 'retard'];

    // Step 1: Direct word filter (lightning fast 🔥)
    if (bannedWords.some(word => rawMessage.includes(word))) {
      await message.delete().catch(() => {});
      return message.channel.send({
        content: `⚠️ <@${message.author.id}>, language violation detected.`
      });
    }

    // Step 2: Use ruthless LLM to judge vibe
    const prompt = `You're a strict Discord moderation system. Analyze this message:\n"${message.content}"\n\nIf it includes profanity, hate speech, slurs, insults, spam, or harmful content, ONLY reply with "MODERATE". If clean, ONLY reply "OK". Do NOT explain anything.`;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'nousresearch/nous-hermes-2-mixtral:free',
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://zex.dortz.zone',
            'X-Title': 'ZEX-AUTO+'
          }
        }
      );

      const reply = response.data.choices?.[0]?.message?.content?.toLowerCase().trim();
      console.log(`[ZEX MOD] Hermes replied: ${reply}`);

      if (reply.includes('moderate')) {
        await message.delete().catch(() => {});
        await message.channel.send({
          content: `🚫 <@${message.author.id}> your message violated our rules.`
        });
      }

    } catch (err) {
      console.error('❌ MOD AI Error:', err);
    }
  });
};