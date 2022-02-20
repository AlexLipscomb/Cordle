/**
 * Select a random element from an array
 * @param {any[]} arr The array to randomly select from
 * @return {any} The randomly selected element
 */
export function randChoose(arr: any[]): any {
    return arr[Math.floor(Math.random() * arr.length)];
}


/**
 * Check if a string is made exclusively of ascii characters
 * @param {string} str The string to check
 * @return {boolean}
 */
export function isASCII(str: string): boolean {
    return /[a-zA-Z]+/.test(str);
}
