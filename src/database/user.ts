import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';

// Retrieves the Supabase user_id for a given Discord user_id. If the user does not exist in the database, a new user is created.
export async function getOrCreateUser(
    supabase: SupabaseClient,
    discordUserId: string, 
    discordUsername: string, 
    role: 'admin' | 'member' = 'member'
) {
    // Check if the user already exists
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('discord_id', discordUserId)
        .single(); // expect only one result

    if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
        console.error('Error fetching user:', error);
        return null;
    }

    if (data) {
        console.log(`Existing user found: ${data.id} with role: ${role}`);
        return data.id; // User exists, return user_id
    }

    // User doesn't exist, create them
    const newUserId = uuidv4();
    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ 
            id: newUserId, 
            discord_id: discordUserId, 
            username: discordUsername,
            role: role
        }])
        .select('id')
        .single();

    if (insertError) {
        console.error('Error creating user:', insertError);
        return null;
    }

    return newUser.id;
}

/** 
 * Promotes a user from 'member' to 'admin'. 
 * @param discordUserId - The Discord user ID of the user to promote.
 * @returns The updated user object or null if there was an error.
 */
export async function promoteUserToAdmin(
    supabase: SupabaseClient, 
    discordUserId: string
) {
    const { data, error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('discord_id', discordUserId)
        .eq('role', 'member') // Ensure only 'member' users are promoted
        .select()
        .single();

    return error ? null : data;
}

/**
 * Demotes a user from 'admin' to 'member'.
 */
export async function demoteUserToMember(
    supabase: SupabaseClient,
    discordUserId: string
) {
    const { data, error } = await supabase
        .from("users")
        .update({ role: "member" })
        .eq("discord_id", discordUserId)
        .eq("role", "admin") // Ensure only 'admin' users are demoted
        .select()
        .single();

    return error ? null : data;
}