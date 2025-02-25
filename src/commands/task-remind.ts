import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { getUserTasks, Task } from "../database/task.js";
import dayjs from "dayjs";

const command = new SlashCommandBuilder()
    .setName("task-remind")
    .setDescription("Reminds you of upcoming or overdue tasks");

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    const today = dayjs().startOf("day");

    try {
        const tasks: Task[] = await getUserTasks(discordId);
        const upcomingTasks = tasks.filter((task: Task) => task.due_date && dayjs(task.due_date).isAfter(today));
        const overdueTasks = tasks.filter((task: Task) => task.due_date && dayjs(task.due_date).isBefore(today));

        let reminderMessage = "🔔 **Task Reminders:**\n\n";

        if (overdueTasks.length > 0) {
            reminderMessage += `**Overdue Tasks:**\n`;
            overdueTasks.forEach((task: Task) => {
                reminderMessage += `• **#${task.id}**: ${task.description} (Due: <t:${dayjs(task.due_date).unix()}:R>)\n`;
            });
        }

        if (upcomingTasks.length > 0) {
            reminderMessage += "\n**Upcoming Tasks:**\n";
            upcomingTasks.forEach((task: Task) => {
                reminderMessage += `• **#${task.id}**: ${task.description} (Due: <t:${dayjs(task.due_date).unix()}:R>)\n`;
            });
        }

        if (upcomingTasks.length === 0 && overdueTasks.length === 0) {
            reminderMessage = "✅ You have no upcoming or overdue tasks!";
        }

        await interaction.editReply({ content: reminderMessage });
    } catch (error) {
        console.error("Error fetching reminders:", error);
        await interaction.editReply({ content: "Failed to fetch task reminders." });
    }
}

export default { data: command, execute };