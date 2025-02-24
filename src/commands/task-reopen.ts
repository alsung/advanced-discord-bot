import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { reopenTask } from "../database/task.js";

const command = new SlashCommandBuilder()
    .setName("task-reopen")
    .setDescription("Reopens a completed task")
    .addIntegerOption(option => 
        option.setName("task_id")
            .setDescription("The ID of the task to reopen")
            .setRequired(true)
    );

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    const taskId = interaction.options.getInteger("task_id")!;

    try {
        const reopenedTask = await reopenTask(discordId, taskId);

        await interaction.editReply({
            content: `Task **#${reopenedTask.id}** has been reopened.`
        });
    } catch (error) {
        const errorMessage = (error as Error).message;

        if (errorMessage.includes("cannot be reopened")) {
            await interaction.editReply({ content: `${errorMessage}` });
        } else {
            console.error("Error reopening task:", error);
            await interaction.editReply({ content: "You do not have permission to reopen this task or it does not exist." });
        }
    }
}

export default { data: command, execute };