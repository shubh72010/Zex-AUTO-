const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();
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

// Init Automod logic
automod(client);

// Bot ready event
client.once('ready', () => {
  console.log(`🤖 ZEX AUTO+ is online as ${client.user.tag}`);
});

// Start the bot
client.login(process.env.TOKEN);

// Fake express ping route to keep bot live
app.get('/', (_, res) => res.send('ZEX AUTO+ running fine.'));
app.listen(3000, () => {
  console.log('🌐 Express live at port 3000');
});