import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { getTaskStatus } from "../database/task.js";

const command = new SlashCommandBuilder()
    .setName("task-check-status")
    .setDescription("Checks the status of a task")
    .addIntegerOption(option => 
        option.setName("task_id")
            .setDescription("The ID of the task")
            .setRequired(true)
    );

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const taskId = interaction.options.getInteger("task_id", true);

    try {
        const task = await getTaskStatus(taskId);
        await interaction.editReply({
            content: `**#${task.id} - ${task.description}**\nStatus: ${task.status} (Assigned to: ${task.assignee_username})`
        });
    } catch (error) {
        console.error("Error getting task status:", error);
        await interaction.editReply({ content: "Failed to get task status."});
    }
}

export default { data: command, execute };