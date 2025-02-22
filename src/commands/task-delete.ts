import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { deleteTask } from "../database/task.js";

const command = new SlashCommandBuilder()
    .setName("task-delete")
    .setDescription("Deletes a task")
    .addIntegerOption(option => 
        option.setName("task_id")
            .setDescription("The ID of the task to delete")
            .setRequired(true)
    );

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    const taskId = interaction.options.getInteger("task_id")!;

    try {
        const result = await deleteTask(discordId, taskId);
        await interaction.editReply({ content: `${result.message}` });
    } catch (error) {
        console.error("Error deleting task:", error);
        await interaction.editReply({ content: "You do not have permission to delete this task or it does not exist." });
    }
}

export default { data: command, execute };