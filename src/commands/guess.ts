import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {Cordle} from '../Cordle/Cordle.class';
import {CordleGameState, GameCache} from '../Cordle/GameCache';
import {isASCII} from '../utils';


module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Make a guess')
        .addStringOption((option) =>
            option
                .setName('guess')
                .setDescription('Make a guess')
                .setRequired(true),
        ),
    async execute(interaction: CommandInteraction) {
        const userGameState: CordleGameState | undefined = GameCache.get(
            interaction.user.id,
        );

        if (!userGameState) {
            await interaction.reply(
                {
                    content: 'Game not started',
                    ephemeral: true,
                },
            );
            return;
        }

        const guess = interaction.options.getString('guess') as string;

        const numLetters = userGameState.numLetters;
        const numGuesses = userGameState.numLetters;

        const cordle = new Cordle(userGameState);
        cordle.initialize();

        if (!isASCII(guess)) {
            await interaction.reply(
                {
                    content: 'Guess has non-letters',
                    ephemeral: true,
                },
            );

            return;
        }


        if (guess.length < numLetters) {
            await interaction.reply(
                {
                    content: 'Incorrect number of characters',
                    ephemeral: true,
                },
            );
        } else {
            cordle.makeGuess(guess).then((value) => {
                GameCache.set(interaction.user.id, value.result);
                const squares = value.result.matches.map((matches) => {
                    return cordle.buildSquares(matches)!.join(' ');
                });


                const res = squares.map((item, index) => {
                    const currentGuess = value.result.guesses[index]
                        .split('').join('  '); // formatting
                    return `${currentGuess}\n` +
                            `${item}\n` +
                            `${'-'.repeat(value.result.numLetters * 3)}\n`;
                }).concat(
                    `${value.result.totalGuesses}/${numGuesses + 1} Guesses`,
                ).join('');

                switch (value.state) {
                case 1:
                    interaction.reply(
                        {
                            // eslint-disable-next-line max-len
                            content: `${interaction.user.username} Won!\n\n` +
                                `Word Was **${value.result.answer}**` +
                                `\`\`\`\n${res}\n\`\`\``,
                        },
                    );
                    GameCache.del(interaction.user.id);
                    break;
                case -1:
                    interaction.reply(
                        {
                            // eslint-disable-next-line max-len
                            content: `${interaction.user.username} Lost!\n\n` +
                                `Word Was **${value.result.answer}**` +
                                `\`\`\`\n${res}\n\`\`\``,
                        },
                    );
                    GameCache.del(interaction.user.id);
                    break;
                case 0:
                    interaction.reply(
                        {
                            content: `\`\`\`\n${res}\n\`\`\``,
                            ephemeral: true,
                        },
                    );
                    break;
                }
            });
        }
    },
};

