import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {GameCache, CordleGameState} from '../Cordle/GameCache';
import {randChoose} from '../utils';
import WordList from '../Cordle/wordlist.json';


module.exports = {
    data: new SlashCommandBuilder()
        .setName('newgame')
        .setDescription('Start a new game')
        .addIntegerOption((option) =>
            option
                .setName('letters')
                .setDescription('The number of letters in the word')
                .setMinValue(2)
                .setMaxValue(27),
        )
        .addIntegerOption((option) =>
            option
                .setName('guesses')
                .setDescription('The number of guesses available')
                .setMinValue(1)
                .setMaxValue(10),
        ),
    async execute(interaction: CommandInteraction) {
        const userId: string = interaction.user.id;
        let numLetters: number = 5;
        let numGuesses: number = 6;

        const numLettersOption = interaction.options.getInteger('letters');
        const numGuessesOption = interaction.options.getInteger('guesses');

        if (numLettersOption) {
            numLetters = numLettersOption;
        }

        if (numGuessesOption) {
            numGuesses = numGuessesOption;
        }

        if (numLetters < 0 || numLetters > 27) {
            await interaction.reply(
                {
                    content: 'Letters must be between 0 and 27',
                    ephemeral: true,
                },
            );
            return;
        }

        if (numGuesses < 0 || numGuesses > 10) {
            await interaction.reply(
                {
                    content: 'Guesses must be between 0 and 10',
                    ephemeral: true,
                },
            );
            return;
        }

        const gameState: CordleGameState = {
            userId: userId,
            answer: randChoose(
                WordList[numLetters.toString() as keyof typeof WordList],
            ),
            numLetters: numLetters,
            numGuesses: numGuesses + 1,
            totalGuesses: 0,
            guesses: [] as string[],
            matches: [] as number[][],
        };

        GameCache.set(userId, gameState);

        await interaction.reply(
            {
                content: 'New game started!\n\n' +
                `Letters: ${numLetters}\n` +
                `Guesses: ${numGuesses}`,
                ephemeral: true,
            },
        );
    },
};
