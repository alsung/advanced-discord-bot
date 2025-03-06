import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
    console.error("Missing environment variables in .env");
    process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
    try {
        console.log("Clearing all registered commands...");
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
        console.log("Successfully cleared all commands.");
    } catch (error) {
        console.error("Failed to clear commands:", error);
    }
})();