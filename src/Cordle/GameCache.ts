import NodeCache from 'node-cache';


export interface CordleGameState {
    answer: string;
    numLetters: number;
    numGuesses: number;
    totalGuesses: number;
    guesses: string[];
    matches: number[][];
}

const GameCache = new NodeCache();

export {GameCache};
