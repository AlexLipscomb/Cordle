import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction, User} from 'discord.js';
import {Cordle, CordleGame} from '../Cordle/Cordle.class';
import {CordleGameState, GameCache} from '../Cordle/GameCache';
import {isASCII} from '../utils';


export const data = new SlashCommandBuilder()
    .setName('guess')
    .setDescription('Make a guess')
    .addStringOption((option) =>
        option
            .setName('guess')
            .setDescription('Make a guess')
            .setRequired(true),
    );


/**
 * The execute function for the command
 * @param {CommandInteraction} interaction
 * @return {void}
 */
export async function execute(interaction: CommandInteraction): Promise<void> {
    const userGameState: CordleGameState | undefined = GameCache.get(
        interaction.user.id,
    );

    if (!userGameState) {
        await interaction.reply(
            {
                content: 'Game not started. Start a new game with `newgame`',
                ephemeral: true,
            },
        );
        return;
    }

    const guess: string = interaction.options.getString('guess') as string;

    const numLetters: number = userGameState.numLetters;

    const cordle: Cordle = new Cordle(userGameState);
    cordle.initialize();

    if (!isASCII(guess)) {
        await interaction.reply(
            {
                content: 'Guess has invalid characters',
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

        return;
    }

    cordle.makeGuess(guess).then((cordleGame) => {
        GameCache.set(interaction.user.id, cordleGame.result);

        // Convert matches to new array of squares
        const squares: string[] = cordleGame.result.matches.map((matches) => {
            return cordle.buildSquares(matches)!.join(' ');
        });

        switch (cordleGame.state) {
        case 1:
            handleCordleWin(cordleGame, squares, interaction);
            break;
        case -1:
            handleCordleLose(cordleGame, squares, interaction);
            break;
        case 0:
            handleCordleContinue(cordleGame, squares, interaction);
            break;
        }
    });
}

/* eslint-disable max-len */
/**
 * Handle a win event for the Cordle game
 * @param {CordleGame} cordleGame
 * @param {string[]} squares
 * @param {CommandInteraction} interaction
 */
function handleCordleWin(cordleGame: CordleGame, squares: string[], interaction: CommandInteraction): void {
    const user: User = interaction.user;
    const answer: string = cordleGame.result.answer;
    const winMessage: string = formatWinMessage(user.username, answer);
    const formattedSquares: string = formatSquares(cordleGame, squares);
    const formattedNumGuesses: string = formatNumGuesses(cordleGame);

    interaction.reply(
        {
            content: `${winMessage}\n\n${formattedSquares}\n${formattedNumGuesses}`,
        },
    );

    GameCache.del(user.id);
}

/**
 * Handle a lose event for the Cordle game
 * @param {CordleGame} cordleGame
 * @param {string[]} squares
 * @param {CommandInteraction} interaction
 */
function handleCordleLose(cordleGame: CordleGame, squares: string[], interaction: CommandInteraction): void {
    const user: User = interaction.user;
    const answer: string = cordleGame.result.answer;
    const loseMessage: string = formatLoseMessage(user.username, answer);
    const formattedSquares: string = formatSquares(cordleGame, squares);
    const formattedNumGuesses: string = formatNumGuesses(cordleGame);

    interaction.reply(
        {
            content: `${loseMessage}\n\n${formattedSquares}\n\n${formattedNumGuesses}`,
        },
    );

    GameCache.del(user.id);
}

/**
 * Handle a continue event for the Cordle game
 * @param {CordleGame} cordleGame
 * @param {string[]} squares
 * @param {CommandInteraction} interaction
 */
function handleCordleContinue(cordleGame: CordleGame, squares: string[], interaction: CommandInteraction): void {
    const formattedSquares: string = formatSquares(cordleGame, squares);
    const formattedNumGuesses: string = formatNumGuesses(cordleGame);

    interaction.reply(
        {
            content: `${formattedSquares}\n${formattedNumGuesses}`,
            ephemeral: true,
        },
    );
}
/* eslint-enable max-len */

/**
 * Format the win message for a Cordle game
 * @param {string} username
 * @param {string} answer
 * @return {string}
 */
function formatWinMessage(username: string, answer: string): string {
    return `${username} Won!\n\nWord was **${answer}**`;
}


/**
 * Format the lose message for a Cordle game
 * @param {string} username
 * @param {string} answer
 * @return {string}
 */
function formatLoseMessage(username: string, answer: string): string {
    return `${username} Lost!\n\nWord was **${answer}**`;
}

/**
 * Format the squares for Cordle events
 * @param {CordleGame} cordleGame
 * @param {string[]} squares
 * @return {string}
 */
function formatSquares(cordleGame: CordleGame, squares: string[]): string {
    const guessSeparator: string = '-'.repeat(cordleGame.result.numLetters * 3);
    const tripleBackticks: string = '\`'.repeat(3);

    const guessHistory: string[] = squares.map((item, index) => {
        const currentGuess: string = cordleGame.result.guesses[index]
            .split('')
            .join('  ');

        return `${currentGuess}\n${item}\n${guessSeparator}\n`;
    });

    return `${tripleBackticks}\n${guessHistory.join('')}\n${tripleBackticks}`;
}

/**
 * Format the string displaying the number of guesses made
 * @param {CordleGame} cordleGame
 * @param {number} numGuesses
 * @return {string}
 */
function formatNumGuesses(cordleGame: CordleGame): string {
    return (
        `${cordleGame.result.totalGuesses}/` +
        `${cordleGame.result.numGuesses} Guesses`
    );
}
