import { SlashCommandBuilder, ChatInputCommandInteraction, time } from "discord.js";
import { setTaskDueDate } from "../database/task.js";
import dayjs from "dayjs";

const command = new SlashCommandBuilder()
    .setName("task-due")
    .setDescription("Set or view a task's due date")
    .addIntegerOption(option => 
        option.setName("task_id")
            .setDescription("The ID of the task")
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName("due_date")
            .setDescription("Due date in YYYY-MM-DD format (leave blank to clear)") 
            .setRequired(false)
    );

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    const taskId = interaction.options.getInteger("task_id")!;
    const dueDateInput = interaction.options.getString("due_date");

    let dueDate = null;
    if (dueDateInput) {
        if (!dayjs(dueDateInput, "YYYY-MM-DD", true).isValid()) {
            await interaction.editReply({ content: "Invalid date format. Please use YYYY-MM-DD." });
            return;
        }
        dueDate = dayjs(dueDateInput).toISOString();
    }

    try {
        const updatedTask = await setTaskDueDate(discordId, taskId, dueDate);

        await interaction.editReply({
            content: dueDate
                ? `Due date set to ${time(new Date(dueDate), 'D')}.`
                : `Due date cleared.`
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        await interaction.editReply({ content: `${errorMessage}` });
    }
}

export default { data: command, execute };