import { supabase } from "../database/supabaseClient.js";

const DEBUG_MODE = process.env.DEBUG_MODE === "true";

// Conditional username fetching for logging
export const getUsernameForLogging = async (discord_id: string) => {
    if (!DEBUG_MODE) return discord_id;

    const { data: user, error: userError } = await supabase
        .from("users")
        .select("username")
        .eq("discord_id", discord_id)
        .single();

    return user?.username || discord_id;
};