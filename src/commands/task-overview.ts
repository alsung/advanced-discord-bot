import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getTaskOverview, Task } from "../database/task.js";

// Define allowed statuses as a TypeScript type
type TaskStatus = "open" | "in_progress" | "pending_review" | "completed";

const command = new SlashCommandBuilder()
    .setName("task-overview")
    .setDescription("Shows an overview of all tasks grouped by status");

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;

    try {
        const { overview, isAdmin } = await getTaskOverview(discordId);

        // Create a dashboard-style overview
        const embed = new EmbedBuilder()
            .setTitle(`📊 Task Overview`)
            .setDescription(isAdmin ? "All Tasks (Admin View)" : "Your assigned tasks")
            .setColor("#00AAFF");

        // Ensure TypeScript recognizes status as TaskStatus
        Object.keys(overview).forEach((status) => {
            const typedStatus = status as TaskStatus | "unknown";
            const tasks = overview[typedStatus];
            const taskList = tasks.map((task: Task) => `• **#${task.id}**: ${task.description} (Assigned to: ${task.assignee_username})`).join("\n");
            embed.addFields({ name: `${typedStatus.toUpperCase()} (${tasks.length})`, value: taskList || "No tasks", inline: false });
        });

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error("Error fetching task overview:", error);
        await interaction.editReply({ content: "Failed to fetch task overview." });
    }
}

export default { data: command, execute };