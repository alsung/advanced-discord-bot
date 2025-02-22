import { supabase } from './supabaseClient.js';

// Task interface
export interface Task {
    id: number;
    discord_id: string;
    description: string;
    assignee: string;
    created_at: string;
    created_by: string;
}

// Create a new task
export const createTask = async (discord_id: string, username: string, description: string, assignee_id: string, assignee_username: string) => {
    const { data, error } = await supabase
        .from('tasks')
        .insert([{ 
            discord_id,
            description, 
            assignee_id, 
            assignee_username,
            created_by: username
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating task:', error.message);
        throw new Error('Failed to create task');
    }

    return data
};

// Get all tasks for a specific user
export const getUserTasks = async (discord_id: string) => {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('discord_id', discord_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting tasks:', error.message);
        throw new Error('Failed to fetch tasks');
    }

    return data;
};

// Update a task description
export const updateTask = async (task_id: number, newDescription: string) => {
    const { data, error } = await supabase
        .from('tasks')
        .update({ description: newDescription})
        .eq('id', task_id)
        .select()
        .single();

    if (error) {
        console.error('Error updating task:', error.message);
        throw new Error('Failed to update task');
    }

    return data;
};

// Delete a task
export const deleteTask = async (discord_id: string, task_id: number) => {
    // Fetch the task to check permissions
    const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("id, discord_id, created_by")
        .eq("id", task_id)
        .single();

    if (fetchError || !task) {
        console.error("Task not found or error fetching:", fetchError?.message);
        throw new Error("Task not found");
    }

    // Check if the requester is either the task creator or an admin
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("discord_id", discord_id)
        .single();

    if (userError || !user) {
        console.error("User not found:", userError?.message);
        throw new Error("User not found");
    }

    if (task.created_by !== discord_id && user.role !== "admin") {
        throw new Error("You do not have permission to delete this task.");
    }

    // Delete the task
    const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task_id);

    if (deleteError) {
        console.error('Error deleting task:', deleteError.message);
        throw new Error('Failed to delete task');
    }

    return { success: true, message: 'Task deleted' };
};

