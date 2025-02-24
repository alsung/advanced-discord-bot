import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { setTaskStatus } from "../database/task.js";

const command = new SlashCommandBuilder()
    .setName("task-status")
    .setDescription("Changes the status of a task")
    .addIntegerOption(option =>
        option.setName("task_id")
            .setDescription("The ID of the task to update")
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName("status")
            .setDescription("New status (open, in_progress, pending_review, completed)")
            .setRequired(true)
            .addChoices(
                { name: "Open", value: "open" },
                { name: "In Progress", value: "in_progress" },
                { name: "Pending Review", value: "pending_review" },
                { name: "Completed", value: "completed" }
            )
    );

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    const taskId = interaction.options.getInteger("task_id")!;
    const status = interaction.options.getString("status")!;

    try {
        const updatedTask = await setTaskStatus(discordId, taskId, status);
        await interaction.editReply({
            content: `Task **#${updatedTask.id}** status updated to: "${updatedTask.status}"`
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        await interaction.editReply({ content: `${errorMessage}` });
    }
}

export default { data: command, execute };