import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {GameCache} from '../Cordle/GameCache';


export const data = new SlashCommandBuilder()
    .setName('end')
    .setDescription('End the game');


/**
 * The execute function for the command
 * @param {CommandInteraction} interaction
 * @return {Promise<void>}
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
    GameCache.del(interaction.user.id);

    await interaction.reply(
        {
            content: 'Game ended successfully',
            ephemeral: true,
        },
    );
}
