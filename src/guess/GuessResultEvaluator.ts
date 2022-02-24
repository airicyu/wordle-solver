import { LetterFlagMask } from "../mask/LetterFlagMask.js";
import { Word } from "../word/Word.js";
import { ResultType } from "./ResultType.js";
// import util from "util";

export declare interface GuessResultEvaluator {
  answer(): Word | null;
  evaluateGuess(guessWord: Word): Promise<GuessResult>;
}

export class DevGuessResultEvaluator {
  answerWord;
  constructor(answerWord: Word) {
    this.answerWord = answerWord;
  }

  answer() {
    return this.answerWord;
  }

  async evaluateGuess(guessWord: Word): Promise<GuessResult> {
    const wordLength = guessWord.word.length;
    const greenSlots = new Array(wordLength).fill(false);
    const yellowSlots = new Array(wordLength).fill(false);

    for (let i = 0; i < wordLength; i++) {
      if (this.answerWord.word[i] === guessWord.word[i]) {
        greenSlots[i] = true;
      }
    }
    for (let i = 0; i < wordLength; i++) {
      if (this.answerWord.word[i] !== guessWord.word[i] && this.answerWord.filterLetter(new LetterFlagMask(guessWord.word[i]))) {
        yellowSlots[i] = true;
      }
    }

    const result = new GuessResult({
      success: greenSlots.filter((_) => _).length == wordLength,
      slot: new Array(wordLength).fill(null).map((_, i) => {
        return (greenSlots[i] && ResultType.GREEN) || (yellowSlots[i] && ResultType.YELLOW) || ResultType.GREY;
      }),
      text: guessWord.word
        .split("")
        .map((char, i) => {
          return (greenSlots[i] && char + "!") || (yellowSlots[i] && char + "?") || char;
        })
        .join(""),
    });

    return result;
  }
}

export class GuessResult {
  success: boolean;
  slot: ResultType[];
  text: string;
  constructor({ success, slot, text }: { success: boolean; slot: ResultType[]; text: string }) {
    this.success = success;
    this.slot = slot;
    this.text = text;
  }
  // [util.inspect.custom](depth: number, opts: any) {
  //   return `{ success: ${this.success}, text: ${this.text} }`;
  // }
}
