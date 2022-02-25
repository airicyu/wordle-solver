import { FlagsBucket } from "./FlagsBucket.js";
import { BitMasks } from "./BitMasks.js";

export class LetterPosFlagMask extends FlagsBucket {
  numLetters;
  static charA2Z = "abcdefghijklmnopqrstuvwxyz";
  static charA = "a".charCodeAt(0);
  static charZ = "z".charCodeAt(0);

  _pos: number[] = [];
  constructor(numLetters: number) {
    super(Math.ceil((26 * numLetters) / 8), Math.ceil((26 * numLetters) / 8) * 8 - 26 * numLetters); // 17 = Math.ceil(26 * 5 / 8); 6 = 17 * 8 - 26 * 5
    this.numLetters = numLetters;
    for (let i = 0; i < numLetters; i++) {
      this._pos.push(i);
    }
  }

  wordPattern(wordCode: string) {
    for (let i = 0; i < wordCode.length; i++) {
      if (wordCode.charAt(i) !== "*") {
        this.charAtPos(wordCode.charAt(i), i);
      }
    }
    return this;
  }

  getChars(): string {
    return Array.from(this.getCharSet()).join("");
  }

  getCharSet(): Set<string> {
    let chars = new Set<string>();
    for (let pos of this._pos) {
      for (let char of LetterPosFlagMask.charA2Z) {
        const [i1, i2] = BitMasks.calFlagPos(pos, char);
        if (this.getBit(i1, i2)) {
          chars.add(char);
        }
      }
    }

    return chars;
  }

  charAtPos(char: string, pos: number) {
    const [i1, i2] = BitMasks.calFlagPos(pos, char);
    this.setBit(i1, i2);
    return this;
  }

  charAtPosItems(charPosItems: [string, number][]) {
    for (let [char, pos] of charPosItems) {
      this.charAtPos(char, pos);
    }
    return this;
  }

  noChars(chars: string) {
    for (let char of chars) {
      for (let pos of this._pos) {
        const [i1, i2] = BitMasks.calFlagPos(pos, char);
        this.unsetBit(i1, i2);
      }
    }
    return this;
  }
}
