import { FlagsBucket } from "./FlagsBucket.js";
import { BitMasks } from "./BitMasks.js";

export class LetterFlagMask extends FlagsBucket {
  static charA2Z = "abcdefghijklmnopqrstuvwxyz";
  static charA = "a".charCodeAt(0);
  static charZ = "z".charCodeAt(0);

  constructor(chars?: string) {
    super(4, 6);
    if (chars) {
      this.chars(chars);
    }
  }

  chars(chars: string) {
    for (let char of chars) {
      const [i1, i2] = BitMasks.calFlagPos(0, char);
      this.setBit(i1, i2);
    }
    return this;
  }

  getChars(): string {
    return Array.from(this.getCharSet()).join("");
  }

  getCharSet(): Set<string> {
    let chars = new Set<string>();
    for (let char of LetterFlagMask.charA2Z) {
      const [i1, i2] = BitMasks.calFlagPos(0, char);
      if (this.getBit(i1, i2)) {
        chars.add(char);
      }
    }
    return chars;
  }

  // noChars(chars: string) {
  //   for (let char of chars) {
  //     const [i1, i2] = BitMasks.calFlagPos(0, char);
  //     this.unsetBit(i1, i2);
  //   }
  //   return this;
  // }
}
