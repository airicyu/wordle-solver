import { LetterFlagMask } from "../mask/LetterFlagMask.js";
import { LetterPosFlagMask } from "../mask/LetterPosFlagMask.js";
import { FlagsBucket } from "../mask/FlagsBucket";
// import util from "util";

export class Word {
  word;
  private letterFlagMask = new LetterFlagMask("");
  private letterPosFlagMask = new LetterPosFlagMask(0);

  constructor(word: string) {
    this.word = word;
    this.letterPosFlagMask = new LetterPosFlagMask(word.length);
    this.buildLetterFlagMask();
    this.buildLetterPosFlagMask();
  }

  getCharSet() {
    return this.letterFlagMask.getCharSet();
  }

  buildLetterFlagMask() {
    for (let i = 0; i < this.word.length; i++) {
      this.letterFlagMask.chars(this.word[i]);
    }
  }

  buildLetterPosFlagMask() {
    for (let i = 0; i < this.word.length; i++) {
      this.letterPosFlagMask.charAtPos(this.word[i], i);
    }
  }

  filterLetter(mask: FlagsBucket) {
    return this.letterFlagMask.filterMask(mask);
  }

  filterLetterNot(mask: FlagsBucket) {
    return this.letterFlagMask.filterNotMask(mask);
  }

  filterLetterPos(mask: FlagsBucket) {
    return this.letterPosFlagMask.filterMask(mask);
  }

  filterLetterNotPos(mask: FlagsBucket) {
    return this.letterPosFlagMask.filterNotMask(mask);
  }

  toString() {
    return this.word;
  }

  // [util.inspect.custom](depth: number, opts: any) {
  //   return this.word;
  // }
}
