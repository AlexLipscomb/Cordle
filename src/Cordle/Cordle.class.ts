import {CordleGameState} from './GameCache';
import {isASCII} from '../utils';


interface WordChar {
    positions: number[];
    occurances: number;
}

export interface CordleGame {
    state: number,
    result: CordleGameState,
}

/**
 * An instance of a Cordle game
 */
export class Cordle {
    private _wordMap: Map<string, WordChar> = new Map<string, WordChar>();
    private _isInitialized: boolean = false;
    protected readonly _squares = ['🟩', '🟨', '⬛'];
    protected _totalGuesses: number = 0;
    protected _gameState: CordleGameState;


    /**
     * The constructor
     * @param {CordleGameState} gameState
     */
    constructor(gameState: CordleGameState) {
        this._gameState = gameState;
    }

    /**
     * Initialize the game
     */
    public initialize(): void {
        this._isInitialized = true;

        for (let i = 0; i < this._gameState.answer.length; i++) {
            if (this._wordMap.has(this._gameState.answer[i])) {
                const wc: WordChar = this._wordMap.get(
                    this._gameState.answer[i],
                ) as WordChar;
                wc.occurances++;
                wc.positions.push(i);
                this._wordMap.set(this._gameState.answer[i], wc);
            } else {
                const positions = [i];
                const wc: WordChar = {occurances: 1, positions: positions};
                this._wordMap.set(this._gameState.answer[i], wc);
            }
        }
    }

    /**
     * Make a guess
     * @param {string} guess
     * @return {Promise<CordleGame>}
     */
    public makeGuess(guess: string): Promise<CordleGame> {
        return new Promise<CordleGame>((resolve, reject) => {
            if (!this._isInitialized || !this._gameState.answer) {
                reject(new Error('Cordle not initialized'));
            };

            if (guess.length < this._gameState.answer!.length) {
                reject(new Error('Guess length less than answer length'));
            }

            if (!isASCII(guess)) {
                reject(new Error('Guess has non-letters'));
            }

            this._gameState.totalGuesses += 1;
            const matches: number[] = new Array(this._gameState.answer.length)
                .fill(2);

            this._gameState.matches.push(matches);
            this._gameState.guesses.push(
                guess.substring(0, this._gameState.answer.length),
            );

            if (guess === this._gameState.answer) {
                resolve(
                    {
                        state: 1,
                        result: this._gameState,
                    },
                );
            }

            if (this._gameState.totalGuesses >= this._gameState.numGuesses) {
                resolve({state: -1, result: this._gameState} as CordleGame);
            }


            for (let i = 0; i < guess.length; i++) {
                if (this._wordMap.has(guess[i])) {
                    const wc: WordChar = this._wordMap
                        .get(guess[i]) as WordChar;
                    wc.occurances -= 1;
                    this._wordMap.set(guess[i], wc);

                    // Set the right match types for the current letter
                    if (wc.occurances < 0) {
                        matches[i] = 2;
                    } else if (
                        this._wordMap.get(guess[i])?.positions.includes(i)
                    ) {
                        matches[i] = 0;
                    } else {
                        matches[i] = 1;
                    }
                }
            }

            resolve(
                {
                    state: 0,
                    result: this._gameState,
                } as CordleGame);
        });
    }

    /**
     * Build the squares used in the game
     * @param {number[]} matches
     * @return {string[] | null} Returns an array of squares or null
     */
    public buildSquares(matches: number[]): string[] | null {
        if (!this._isInitialized) return null;

        return new Array(this._gameState.answer!.length).fill('')
            .map((value, index) => {
                return this._squares[matches[index]];
            });
    }
}
