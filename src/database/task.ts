import { supabase } from './supabaseClient.js';
import redis from '../redisClient.js';
import { getUsernameForLogging } from '../utils/logger.js';

// Task interface
export interface Task {
    id: number;
    discord_id: string;
    description: string;
    assignee: string;
    created_at: string;
    created_by: string;
    due_date: string;
    status: string;
    assignee_username: string;
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

    // Get username conditionally for logging
    const creatorName = await getUsernameForLogging(discord_id);
    const assigneeName = await getUsernameForLogging(assignee_id);

    // Invalidate cache for creator's task list and overview
    await redis.del(`task-list:${discord_id}`);
    await redis.del(`task-overview:${discord_id}`);

    // If the task is assigned to someone else, invalidate their cache too
    if (assignee_id !== discord_id) {
        await redis.del(`task-list:${assignee_id}`);
        await redis.del(`task-overview:${assignee_id}`);
    }

    console.log(`Cache invalidated for creator: ${creatorName} and assignee: ${assigneeName}`);
    return data;
};

// Get all tasks for a specific user (with Redis caching)
export const getUserTasks = async (discord_id: string) => {
    // Get username conditionally for logging
    const username = await getUsernameForLogging(discord_id);

    const cacheKey = `task-list:${discord_id}`;
    
    // Check Redis cache first
    const cachedTasks = await redis.get(cacheKey);
    if (cachedTasks) {
        console.log("Cache hit for task list");
        return JSON.parse(cachedTasks);
    }

    console.log("Cache miss for task list. Fetching from DB...");
    const { data, error } = await supabase
        .from('tasks')
        .select("id, description, assignee_username, created_at, status, due_date")
        .eq('discord_id', discord_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting tasks:', error.message);
        throw new Error('Failed to fetch tasks');
    }

    await redis.set(cacheKey, JSON.stringify(data), 'EX', 300); // Cache for 5 minutes

    console.log(`Cached task list for ${username}`);
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

// Add all users in the server to the database
export const addAllUsers = async(guildMembers: any) => {
    // Fetch all existing users from the database
    const { data: existingUsers, error: fetchError } = await supabase
        .from("users")
        .select("discord_id, role")

    if (fetchError) {
        console.error("Error fetching existing users:", fetchError.message);
        throw new Error("Failed to fetch existing users");
    }

    const existingUserMap = new Map(existingUsers.map(user => [user.discord_id, user.role]));

    // Create an array of users to insert or update
    const usersToInsert = guildMembers.map((member: any) => {
        const existingRole = existingUserMap.get(member.id);
        console.log(`Existing role for ${member.user.username}: ${existingRole}`);

        return {
            discord_id: member.id,
            username: member.user.username,
            role: existingRole || "member" // Keep existing role if present, otherwise set to member
        };
    });

    const { data, error } = await supabase
        .from("users")
        .upsert(usersToInsert, { onConflict: "discord_id" });

    if (error) {
        console.error("Error adding users:", error.message);
        throw new Error("Failed to add users");
    }

    return data;
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
};

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
};

// Set task status
export const setTaskStatus = async (discord_id: string, task_id: number, newStatus: string) => {
    // Check if the new status is allowed
    const allowedStatuses = ["open", "in_progress", "pending_review", "completed"];
    if (!allowedStatuses.includes(newStatus)) {
        throw new Error("Invalid status. Allowed statuses are: open, in_progress, pending_review, completed");
    }

    // Fetch the task to check permissions
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
        throw new Error("You do not have permission to change this task's status.");
    }

    // Update the task status
    const { data: updatedTask, error: updateError } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", task_id)
        .select()
        .single();

    if (updateError) {
        console.error("Error updating task status:", updateError.message);
        throw new Error("Failed to update task status");
    }

    return updatedTask;
};

// Show task overview
export const getTaskOverview = async (discord_id: string) => {
    // Get username conditionally for logging
    const username = await getUsernameForLogging(discord_id);

    // Check if the requester is an admin
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("discord_id", discord_id)
        .single();

    if (userError || !user) {
        console.error("User not found:", userError?.message);
        throw new Error("User not found");
    }

    // Admins see all tasks, regular users see only their tasks
    const isAdmin = user.role === "admin";
    const cacheKey = isAdmin ? `task-overview:admin` : `task-overview:${discord_id}`;
    
    // Check Redis cache first
    const cachedOverview = await redis.get(cacheKey);
    if (cachedOverview) {
        console.log(`Cache hit for task overview of ${username}`);
        return JSON.parse(cachedOverview);
    }

    console.log(`Cache miss for task overview of ${username}. Fetching from DB...`);

    const filter = isAdmin ? {} : { assignee_id: discord_id };

    // Query tasks and group by status
    const { data: tasks, error: fetchError } = await supabase
        .from("tasks")
        .select("id, description, status, assignee_username")
        .match(filter)
        .order("status", { ascending: true });

    if (fetchError) {
        console.error("Error fetching tasks:", fetchError.message);
        throw new Error("Failed to fetch tasks");
    }

    // Define allowed statuses as a TypeScript type
    type TaskStatus = "pending" | "open" | "in_progress" | "pending_review" | "completed";

    // Group tasks by status
    const overview: Record<TaskStatus | "unknown", any[]> = {
        "pending": [],
        "open": [],
        "in_progress": [],
        "pending_review": [],
        "completed": [],
        unknown: [] // Fallback for unknown statuses
    };

    // Typecast task.status to TaskStatus and handle unknowns
    tasks.forEach(task => {
        const status = task.status as TaskStatus;
        if (overview[status]) {
            overview[status].push(task);
        } else {
            overview.unknown.push(task);
        }
    });

    // Cache the overview in Redis for 5 minutes
    await redis.set(cacheKey, JSON.stringify({ overview, isAdmin }), "EX", 300);

    console.log(`Cached task overview for ${isAdmin ? "admin" : username}`);
    return { overview, isAdmin };
};

// Set task due date
export const setTaskDueDate = async (discord_id: string, task_id: number, dueDate: string | null) => {
    // Fetch the task to check permissions
    const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("id, created_by, due_date")
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
        throw new Error("You do not have permission to change this task's due date.");
    }

    // Update the task's due date
    const { data: updatedTask, error: updateError } = await supabase
        .from("tasks")
        .update({ due_date: dueDate })
        .eq("id", task_id)
        .select()
        .single();

    if (updateError) {
        console.error("Error updating task due date:", updateError.message);
        throw new Error("Failed to update task due date");
    }

    return updatedTask;
};