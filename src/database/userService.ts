import { supabase } from "./supabaseClient.js";

// Retrieves the Supabase user_id for a given Discord user_id. If the user does not exist in the database, a new user is created.
export async function getOrCreateUser(discordUserId: string, discordUsername: string, role: 'admin' | 'member' = 'member') {
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

    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ 
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

