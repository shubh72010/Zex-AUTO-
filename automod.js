const axios = require('axios');

module.exports = function deepseekAutomod(client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const rawMessage = message.content.toLowerCase();
    const keywords = ['fuck', 'shit', 'bitch', 'slut', 'dick', 'nigga', 'nigger']; // Add more if needed

    // Step 1: Check basic banned words first
    if (keywords.some(word => rawMessage.includes(word))) {
      await message.delete().catch(() => {});
      return message.channel.send({
        content: `⚠️ <@${message.author.id}>, watch your language!`
      });
    }

    // Step 2: Ask DeepSeek if it’s inappropriate
    const prompt = `You are a Discord moderation bot. If the following message contains swearing, hate speech, slurs, threats, or bullying, respond with "MODERATE". Otherwise respond with "OK".\n\nMessage: "${message.content}"`;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'tngtech/deepseek-r1t2-chimera:free',
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
      console.log(`[MOD-CHECK] DeepSeek replied: ${reply}`);

      if (reply.includes('moderate')) {
        await message.delete().catch(() => {});
        await message.channel.send({
          content: `⚠️ <@${message.author.id}>, your message was flagged for moderation.`
        });
      }
    } catch (err) {
      console.error('❌ DeepSeek Moderation Failed:', err);
    }
  });
};