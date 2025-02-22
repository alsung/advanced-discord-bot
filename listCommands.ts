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
        console.log("Fetching registered commands...");
        const commands = await rest.get(Routes.applicationCommands(CLIENT_ID));
        console.log("Registered Commands:", commands);
    } catch (error) {
        console.error("Error fetching commands:", error);
    }
})();