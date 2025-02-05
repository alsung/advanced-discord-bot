// src/index.ts

import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Create a new Discord client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

// Log in using the bot token from the .env file
client.login(process.env.DISCORD_BOT_TOKEN);