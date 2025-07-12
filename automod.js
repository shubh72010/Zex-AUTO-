const axios = require('axios');

module.exports = function deepseekAutomod(client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    try {
      const prompt = `Is this message toxic, offensive, or spam? Respond only with 'OK' or 'MODERATE'. Message: "${message.content}"`;

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
            "HTTP-Referer": "https://zex.dortz.zone",
            "X-Title": "ZEX-AUTO+",
          },
        }
      );

      const result = response.data.choices?.[0]?.message?.content?.toLowerCase();

      if (result && result.includes('moderate')) {
        await message.delete();
        await message.channel.send({
          content: `⚠️ <@${message.author.id}>, your message was flagged by ZEX-AUTO+'s smart filter.`,
        });
        console.log(`Moderated: ${message.content}`);
      }

    } catch (err) {
      console.error('DeepSeek automod error:', err);
    }
  });
};