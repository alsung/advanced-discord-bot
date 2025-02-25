import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { getUserTasks, Task } from "../database/task.js";

const command = new SlashCommandBuilder()
    .setName("task-list")
    .setDescription("Lists all your assigned tasks");

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;

    try {
        const tasks = await getUserTasks(discordId);

        if (!tasks.length) {
            return interaction.editReply({ content: "You have no tasks assigned." });
        }

        const taskList = tasks.map((task: Task) => `**#${task.id}** - ${task.description} - Status: ${task.status} (Assigned to: ${task.assignee_username})`).join("\n");

        await interaction.editReply({ content: `**Your Tasks:**\n${taskList}` });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        await interaction.editReply({ content: "Error retrieving task list." });
    }
}

export default { data: command, execute };