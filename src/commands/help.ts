import { SlashCommandBuilder, ChatInputCommandInteraction, REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;

const command = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows a list of all available commands");

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    try {
        // Fetch commands directly from Discord API
        const commands = await rest.get(Routes.applicationCommands(CLIENT_ID));

        if (!Array.isArray(commands) || commands.length === 0) {
            return interaction.editReply({ content: "No commands found." });
        }

        // Format commands into a readable list
        const commandsList = commands.map((cmd: any) => {
            return `**/${cmd.name}** - ${cmd.description}`;
        }).join("\n");

        const helpMessage = `**Available Commands:**\n\n${commandsList}`;
        await interaction.editReply({ content: helpMessage });
    } catch (error) {
        console.error("Error fetching commands:", error);
        await interaction.editReply({ content: "Error retrieving command list." });
    }
}

export default { data: command, execute };