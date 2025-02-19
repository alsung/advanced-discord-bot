// Retrieve the Discord user's ID and username
// Look up or create a user in the users table
// Create a new task in the tasks table
// Reply to the user with confirmation

import { SlashCommandBuilder } from "discord.js";
import { getOrCreateUser } from "../database/userService.js";