import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';

/**
 * Retrieves an existing user by their Discord ID or creates a new user if they don't exist.
 * @param discord_id - The Discord ID of the user.
 * @param username - The Discord username of the user.
 * @returns The Discord ID of the user.
 */
export async function getOrCreateUser(
    supabase: SupabaseClient,
    discord_id: string, 
    username: string, 
    role: 'admin' | 'member' = 'member'
) {
    // Check if the user already exists
    const { data, error } = await supabase
        .from("users")
        .select("discord_id, role")
        .eq("discord_id", discord_id)
        .single(); // expect only one result

    if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
        console.error('Error fetching user:', error);
        return null;
    }

    if (data) {
        console.log(`Existing user found: ${data.discord_id} with role: ${role}`);
        return data.discord_id; // User exists, return user_id
    }

    // User doesn't exist, create them
    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ 
            discord_id, 
            username,
            role: "member"
        }])
        .select()
        .single();

    if (insertError) {
        console.error("Error creating user:", insertError.message);
        throw new Error("Failed to create user.");
    }

    return newUser.discord_id;
}

/** 
 * Promotes a user from 'member' to 'admin'. 
 * @param discordUserId - The Discord user ID of the user to promote.
 * @returns The updated user object or null if there was an error.
 */
export async function promoteUserToAdmin(
    supabase: SupabaseClient, 
    discord_id: string
) {
    const { data, error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('discord_id', discord_id)
        .eq('role', 'member') // Ensure only 'member' users are promoted
        .select()
        .single();

    if (error || !data) {
        console.error("Error promoting user to admin:", error?.message || "User not found.");
        throw new Error("Failed to promote user.");
    }

    return data;
}

/**
 * Demotes a user from 'admin' to 'member'.
 */
export async function demoteUserToMember(
    supabase: SupabaseClient,
    discord_id: string
) {
    const { data, error } = await supabase
        .from("users")
        .update({ role: "member" })
        .eq("discord_id", discord_id)
        .eq("role", "admin") // Ensure only 'admin' users are demoted
        .select()
        .single();

    return error ? null : data;
}