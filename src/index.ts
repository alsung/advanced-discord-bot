// src/index.ts
import { ChatInputApplicationCommandData, ChatInputCommandInteraction, Client, GatewayIntentBits, REST, Routes, Collection, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { Command } from './types/command.js';
import { ExtendedClient } from './types/client.js';
import { supabase } from './database/supabaseClient.js';

// Load environment variables from .env
dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

console.log("TOKEN:", TOKEN);
console.log("CLIENT_ID:", CLIENT_ID);

if (!TOKEN || !CLIENT_ID) {
    console.error('Missing environment variables in .env');
    process.exit(1);
}

// Initialize Discord client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
}) as ExtendedClient;

// Initialize commands collection
client.commands = new Collection<string, Command>();

// Define the commands array
const commands: SlashCommandBuilder[] = [];

// Get directory name from dynamic command loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load commands from the "commands" folder
const commandsPath = join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    try {
        // Dynamically import each command module
        const commandModule = await import(join(commandsPath, file));

        for (const exportName in commandModule) {
            const command = commandModule[exportName];

            if (command?.data && command?.execute) {
                console.log(`Loading command: "${command.data.name}" from "${file}"`);
                client.commands.set(command.data.name, command);
                commands.push(command.data);
            } else {
                console.warn(`Export "${exportName}" in file "${file}" is not a valid command.`);
            }
        }
    } catch (error) {
        console.error(`Failed to load command from file: ${file}`, error);
    }
}

// Register commands with Discord API
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
    try {
        console.log("Registering application (/) commands...");

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );

        console.log("Successfully registered application (/) commands.");
    } catch (error) {
        console.error("Error registering commands:", error);
    }
})();

// Handle bot interactions dynamically
client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        console.log(`Interaction received: ${interaction.commandName}`);
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);

        await interaction.reply({
            content: "there was an error while executing this command!",
            ephemeral: true
        });
    }
});

client.once('ready', () => {
    console.log(`Bot is online as ${client.user?.tag}`);
});

// Event: Triggered when a new member joins the server
client.on("guildMemberAdd", async (member) => {
    console.log(`New member joined: ${member.user.username} (${member.user.id})`);

    // Check if the user already exists in the database
    const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("discord_id")
        .eq("discord_id", member.user.id)
        .single();

    if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking user in database:", fetchError);
        return;
    }

    if (existingUser) {
        console.log(`User ${member.user.username} already exists in the database.`);
        return;
    }

    // Insert new user into Supabase
    const { error: insertError } = await supabase.from("users").insert([
        {
            discord_id: member.user.id,
            username: member.user.username,
            role: "member",
        }
    ]);

    if (insertError) {
        console.error("Failed to add new user to database:", insertError);
        return;
    }

    console.log(`User ${member.user.username} added to the database as "member".`);
});

// Log in using the bot token from the .env file
client.login(process.env.DISCORD_BOT_TOKEN);