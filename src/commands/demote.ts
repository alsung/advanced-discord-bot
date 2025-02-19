import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { demoteUserToMember } from "../database/user.js";
import { supabase } from "../database/supabaseClient.js";

const command = new SlashCommandBuilder()
    .setName("denote")
    .setDescription("Demotes an admin back to member")
    .addUserOption(option =>
        option.setName("user")
            .setDescription("The user to demote")
            .setRequired(true)
    );

/**
 * Executes the demote command.
 */
async function execute(interaction: ChatInputCommandInteraction) {
    const adminUserId = interaction.user.id;
    const targetUser = interaction.options.getUser("user");

    if (!targetUser) {
        return interaction.reply({ content: "User not found", ephemeral: true });
    }

    // Fetch the command sender's role from Supabase
    let { data: adminData, error: adminError } = await supabase
        .from("users")
        .select("role")
        .eq("discord_id", adminUserId)
        .single();

    // if user doesn't exist, create them as "member" first
    if (!adminData && !adminError) {
        console.log(`User ${adminUserId} not found. Creating as "member"...`);
        const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([{ discord_id: adminUserId, role: "member", username: interaction.user.username }])
            .select()
            .single();

        if (createError) {
            console.error("Failed to create user:", createError);
            return interaction.reply({ content: "Database error. Try again later.", ephemeral: true });
        }

        adminData = newUser;
    }

    if (!adminData || adminData.role !== 'admin') {
        return interaction.reply({ content: "You do not have permission to promote users.", ephemeral: true });
    }

    // Fetch the target user's current role
    const { data: targetData, error: targetError } = await supabase
        .from("users")
        .select("role")
        .eq("discord_id", targetUser.id)
        .single();

    if (targetError || !targetData) {
        return interaction.reply({ content: "The specified user does not exist in the database.", ephemeral: true });
    }

    if (targetData.role !== "admin") {
        return interaction.reply({ content: "This user is not an admin and cannot be demoted.", ephemeral: true });
    }

    // Demote the user to member
    const updatedUser = await demoteUserToMember(supabase, targetUser.id);
    if (!updatedUser) {
        return interaction.reply({ content: "Failed to demote the user. Please try again later.", ephemeral: true });
    }

    return interaction.reply({ content: `**${targetUser.username}** has been demoted to **member**.` });
}

export default { data: command, execute };