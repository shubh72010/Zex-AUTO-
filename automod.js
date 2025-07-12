const axios = require('axios');

module.exports = function deepseekAutomod(client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const prompt = `Is the following message offensive, toxic, spam, or harmful in any way? Only respond with 'OK' or 'MODERATE'.\nMessage: "${message.content}"`;

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

      const reply = response.data.choices?.[0]?.message?.content?.toLowerCase();

      if (reply && reply.includes('moderate')) {
        await message.delete();
        await message.channel.send({
          content: `⚠️ <@${message.author.id}>, your message was flagged by ZEX-AUTO+ for moderation.`
        });
      }

    } catch (err) {
      console.error('❌ DeepSeek Moderation Failed:', err);
    }
  });
};