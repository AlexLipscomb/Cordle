import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {GameCache} from '../Cordle/GameCache';


module.exports = {
    data: new SlashCommandBuilder()
        .setName('end')
        .setDescription('End the game'),
    async execute(interaction: CommandInteraction) {
        GameCache.del(interaction.user.id);
        await interaction.reply(
            {
                content: 'Game ended successfully',
                ephemeral: true,
            },
        );
    },
};
