import {CordleGameState} from './GameCache';
import {isASCII} from '../utils';


interface WordChar {
    positions: number[];
    occurances: number;
}

interface CordleGame {
    state: number,
    result: CordleGameState,
}

/**
 * An instance of a Cordle game
 */
export class Cordle {
    protected readonly _squares = ['🟩', '🟨', '⬛'];
    protected _numChars: string = '5';
    protected _numGuesses: number = 6;
    private _wordMap: Map<string, WordChar> = new Map<string, WordChar>();
    public _answer: string | null = null;
    protected _totalGuesses: number = 0;
    private _isInitialized: boolean = false;
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
        this._answer = this._gameState.answer;
        this._totalGuesses = this._gameState.totalGuesses;
        this._isInitialized = true;

        for (let i = 0; i < this._answer!.length; i++) {
            if (!this._wordMap.has(this._answer![i])) {
                const positions = [i];
                const wc: WordChar = {occurances: 1, positions: positions};
                this._wordMap.set(this._answer![i], wc);
            } else {
                const wc: WordChar = this._wordMap.get(
                    this._answer![i],
                ) as WordChar;
                wc.occurances++;
                wc.positions.push(i);
                this._wordMap.set(this._answer![i], wc);
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
            if (!this._isInitialized || !this._answer) {
                reject(new Error('Cordle not initialized'));
            };

            if (guess.length < this._answer!.length) {
                reject(new Error('Guess length less than answer length'));
            }

            if (!isASCII(guess)) {
                reject(new Error('Guess has non-letters'));
            }

            this._gameState.totalGuesses++;
            const matches: Array<number> = new Array(this._answer!.length)
                .fill(2);

            this._gameState.matches.push(matches);
            this._gameState.guesses.push(
                guess.substring(0, this._answer!.length),
            );

            if (guess === this._answer) {
                resolve(
                    {
                        state: 1,
                        result: this._gameState,
                    },
                );
            }

            if (this._gameState.totalGuesses >= this._numGuesses) {
                resolve({state: -1, result: this._gameState} as CordleGame);
            }


            for (let i = 0; i < guess.length; i++) {
                if (this._wordMap.has(guess[i])) {
                    const wc: WordChar = this._wordMap
                        .get(guess[i]) as WordChar;
                    wc.occurances--;
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
     * @return {string[]}
     */
    public buildSquares(matches: number[]) {
        if (!this._isInitialized) return;

        return new Array(this._answer!.length).fill('')
            .map((value, index) => {
                return this._squares[matches[index]];
            });
    }
}
