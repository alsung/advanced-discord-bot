import { ChatInputCommandInteraction, Interaction, SlashCommandBuilder } from "discord.js";

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}