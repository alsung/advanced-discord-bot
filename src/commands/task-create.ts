import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { createTask } from "../database/task.js";

const command = new SlashCommandBuilder()
    .setName("task-create")
    .setDescription("Creates a new task")
    .addStringOption(option => 
        option.setName("description")
            .setDescription("Task description")
            .setRequired(true)
    )
    .addUserOption(option =>
        option.setName("assignee")
            .setDescription("Assign the task to a user (optional)")
            .setRequired(false)
    );

async function execute(interaction: ChatInputCommandInteraction) {
    console.log("/task-create command received!");

    const creatorId = interaction.user.id;
    const creatorUsername = interaction.user.username;
    const description = interaction.options.getString("description")!;
    const assignee = interaction.options.getUser("assignee");

    const assigneeId = assignee?.id ?? creatorId;
    const assigneeUsername = assignee?.username ?? creatorUsername;

    console.log("assignee", assignee?.id);

    try {
        // Use `createTask` function
        const task = await createTask(creatorId, creatorUsername, description, assigneeId, assigneeUsername);

        return interaction.reply({
            content: `Task **${task.description}** created by <@${creatorId}> for ${assignee ? `<@${assignee.id}>` : "themselves"}.`
        });
    } catch (error) {
        console.error("Failed to create task:", error);
        return interaction.reply({ content: "Error creating task.", ephemeral: true });
    }
}

export default { data: command, execute };