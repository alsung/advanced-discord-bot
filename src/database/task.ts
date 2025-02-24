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
        .select("id, description, assignee_username, created_at, status")
        .eq('discord_id', discord_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting tasks:', error.message);
        throw new Error('Failed to fetch tasks');
    }

    return data;
};

// Update a task description
export const updateTask = async (discord_id: string, task_id: number, newDescription: string) => {
    // Fetch the task to check permissions
    const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("id, created_by")
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
        throw new Error("You do not have permission to update this task.");
    }

    // Update the task description
    const { data: updatedTask, error: updateError } = await supabase
        .from("tasks")
        .update({ description: newDescription })
        .eq("id", task_id)
        .select()
        .single();

    if (updateError) {
        console.error("Error updating task:", updateError.message);
        throw new Error("Failed to update task");
    }

    return updatedTask;
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

// Update Task Assignee 
export const updateTaskAssignee = async (discord_id: string, task_id: number, newAssigneeId: string, newAssigneeUsername: string) => {
    // Fetch the task to check permissions and current assignee
    const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("id, created_by, assignee_id, assignee_username")
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
        throw new Error("You do not have permission to reassign this task.");
    }

    // Check if the task is already assigned to the new assignee
    if (task.assignee_id === newAssigneeId) {
        throw new Error(`Task is already assigned to **${task.assignee_username}**.`);
    }

    // Update the task assignee
    const { data: updatedTask, error: updateError } = await supabase
        .from("tasks")
        .update({ assignee_id: newAssigneeId, assignee_username: newAssigneeUsername })
        .eq("id", task_id)
        .select()
        .single();

    if (updateError) {
        console.error("Error updating task assignee:", updateError.message);
        throw new Error("Failed to update task assignee");
    }

    return updatedTask;
};

// Complete a task
export const completeTask = async (discord_id: string, task_id: number) => {
    // Fetch the task to check permissions and current status
    const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("id, created_by, status")
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
        throw new Error("You do not have permission to complete this task.");
    }

    // Check if task is already completed
    if (task.status === "completed") {
        throw new Error("Task is already marked as completed.");
    }

    // Update the status to completed
    const { data: updatedTask, error: updateError } = await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", task_id)
        .select()
        .single();

    if (updateError) {
        console.error("Error updating task status:", updateError.message);
        throw new Error("Failed to complete task");
    }

    return updatedTask;
}

// Reopen a task
export const reopenTask = async (discord_id: string, task_id: number) => {
    // Fetch the task to check permissions and current status
    const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("id, created_by, status")
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
        throw new Error("You do not have permission to reopen this task.");
    }

    // Check if task is already open
    if (task.status !== "completed") {
        throw new Error("Task is not completed and cannot be reopened.");
    }

    // Update the status to open
    const { data: updatedTask, error: updateError } = await supabase
        .from("tasks")
        .update({ status: "open" })
        .eq("id", task_id)
        .select()
        .single();

    if (updateError) {
        console.error("Error updating task status:", updateError.message);
        throw new Error("Failed to reopen task");
    }

    return updatedTask;
}