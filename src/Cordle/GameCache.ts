import NodeCache from 'node-cache';


export interface CordleGameState {
    answer: string;
    numLetters: number;
    numGuesses: number;
    totalGuesses: number;
    guesses: Array<string>;
    matches: Array<Array<number>>;
}

const GameCache = new NodeCache();

export {GameCache};
