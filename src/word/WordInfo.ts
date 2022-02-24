import { LetterFlagMask } from "./../mask/LetterFlagMask";
import { LetterPosFlagMask } from "./../mask/LetterPosFlagMask";

export class WordInfo {
  wordLength: number;
  letterMask: LetterFlagMask;
  letterNotMask: LetterFlagMask;
  letterPosMask: LetterPosFlagMask;
  letterNotPosMask: LetterPosFlagMask;

  constructor(
    wordLength: number,
    letterMask: LetterFlagMask,
    letterNotMask: LetterFlagMask,
    letterPosMask: LetterPosFlagMask,
    letterNotPosMask: LetterPosFlagMask
  ) {
    this.wordLength = wordLength;
    this.letterMask = letterMask;
    this.letterNotMask = letterNotMask;
    this.letterPosMask = letterPosMask;
    this.letterNotPosMask = letterNotPosMask;
  }
}
