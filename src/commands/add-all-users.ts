import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { addAllUsers } from "../database/task.js";

const command = new SlashCommandBuilder()
  .setName("add-all-users")
  .setDescription("Adds all users in the server to the database (Admin Only)");

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;

    // Check if the user is an admin
    const guild = interaction.guild;
    if (!guild) {
        await interaction.editReply({ content: "This command can only be run in a server." });
        return;
    }

    const member = await guild.members.fetch(discordId);
    if (!member?.permissions.has("Administrator")) {
        await interaction.editReply({ content: "You do not have permission to use this command." });
        return;
    }

    try {
        // Fetch all members from the server
        await guild.members.fetch();
        const allMembers = guild.members.cache.filter(member => !member.user.bot);

        type User = {
            discord_id: string;
            username: string;
            role: string;
        };

        // Add all users to the database
        const addedUsers: User[] = (await addAllUsers(Array.from(allMembers.values()))) || [];

        await interaction.editReply({
            content: `Successfully added **${addedUsers?.length ?? 0}** users to the database.`
        });
    } catch (error) {
        console.error("Error adding users:", error);
        await interaction.editReply({ content: "Failed to add users to the database." });
    }
}

export default { data: command, execute };
