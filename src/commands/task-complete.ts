import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { completeTask } from "../database/task.js";

const command = new SlashCommandBuilder()
    .setName("task-complete")
    .setDescription("Marks a task as completed")
    .addIntegerOption(option => 
        option.setName("task_id")
            .setDescription("The ID of the task to mark as completed")
            .setRequired(true)
    );

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    const taskId = interaction.options.getInteger("task_id")!;

    try {
        const completedTask = await completeTask(discordId, taskId);

        await interaction.editReply({
            content: `Task **#${completedTask.id}** marked as completed.`
        });
    } catch (error) {
        const errorMessage = (error as Error).message;

        if (errorMessage.includes("already marked as completed")) {
            await interaction.editReply({ content: `${errorMessage}` });
        } else {
            console.error("Error completing task:", error);
            await interaction.editReply({ content: "You do not have permission to complete this task or it does not exist." });
        }
    }
}

export default { data: command, execute };