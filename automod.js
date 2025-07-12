// automod.js
module.exports = function automod(message) {
  const bannedWords = ['badword1', 'badword2', 'sussy'];
  const content = message.content.toLowerCase();

  for (const word of bannedWords) {
    if (content.includes(word)) {
      message.delete().catch(console.error);
      message.channel.send(`⚠️ ${message.author} said a no-no word.`).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
      break;
    }
  }
};