import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { promoteUserToAdmin } from "../database/user.js";
import { supabase } from "../database/supabaseClient.js";
import { create } from "ts-node";

const command = new SlashCommandBuilder()
    .setName("promote")
    .setDescription("Promote a member to admin")
    .addUserOption(option => 
        option.setName("user")
            .setDescription("The user to promote")
            .setRequired(true)
    );

/**
 * Executes the promote command.
 */
async function execute(interaction: ChatInputCommandInteraction) {
    const adminUserId = interaction.user.id;
    const targetUser = interaction.options.getUser("user");

    if (!targetUser) {
        return interaction.reply({ content: "User not found", ephemeral: true });
    }

    // Fetch the command sender's role
    let { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('role')
        .eq('discord_id', adminUserId)
        .single();

    console.log("adminData:", !adminData);
    console.log("adminError:", !adminError);

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

    if (targetData.role === "admin") {
        return interaction.reply({ content: "This user is already an admin.", ephemeral: true });
    }

    // Promote the user to admin
    const updatedUser = await promoteUserToAdmin(supabase, targetUser.id);
    if (!updatedUser) {
        return interaction.reply({ content: "Failed to promote the user. Please try again later.", ephemeral: true });
    }

    return interaction.reply({ content: `**${targetUser.username}** has been promoted to **admin**.` });
}

export default { data: command, execute };