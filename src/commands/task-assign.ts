import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { updateTaskAssignee } from "../database/task.js";

const command = new SlashCommandBuilder()
    .setName("task-assign")
    .setDescription("Reassigns a task to another user")
    .addIntegerOption(option =>
        option.setName("task_id")
            .setDescription("The ID of the task to reassign")
            .setRequired(true)
    )
    .addUserOption(option =>
        option.setName("assignee")
            .setDescription("Assign the task to a user")
            .setRequired(true)
    );

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    const taskId = interaction.options.getInteger("task_id")!;
    const newAssignee = interaction.options.getUser("assignee")!;

    try {
        const updatedTask = await updateTaskAssignee(discordId, taskId, newAssignee.id, newAssignee.username);
        await interaction.editReply({
            content: `Task **#${updatedTask.id}** reassigned to **${newAssignee.username}**.`
        });
    } catch (error) {
        console.error("Error reassigning task:", error);
        await interaction.editReply({ content: "You do not have permission to reassign this task or it does not exist." });
    }
}

export default { data: command, execute };