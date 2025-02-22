import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { updateTask } from "../database/task.js";

const command = new SlashCommandBuilder()
    .setName("task-update")
    .setDescription("Updates the description of an existing task")
    .addIntegerOption(option => 
        option.setName("task_id")
            .setDescription("The ID of the task to update")
            .setRequired(true)
    )
    .addStringOption(option => 
        option.setName("description")
            .setDescription("The new description for the task")
            .setRequired(true)
    );

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    const taskId = interaction.options.getInteger("task_id")!;
    const newDescription = interaction.options.getString("description")!;

    try {
        const updatedTask = await updateTask(discordId, taskId, newDescription);
        await interaction.editReply({ 
            content: `Task **#${updatedTask.id}** updated to: "${updatedTask.description}"`
        });
    } catch (error) {
        console.error("Error updating task:", error);
        await interaction.editReply({ content: "You do not have permission to update this task or it does not exist." });
    }
}

export default { data: command, execute };