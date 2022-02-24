import { BIT_MASK, BIT_ALL_MASK, BIT_NONE_MASK, FLIP_BIT_MASK, removeHeadBits } from "../util/bitUtil.js";

export class FlagsBucket {
  private numBytes = 0;
  private ignoreBits = 0;
  letterMap = new Uint8Array(0);

  constructor(numBytes: number, ignoreBits: number) {
    this.numBytes = numBytes;
    this.ignoreBits = ignoreBits;
    this.letterMap = new Uint8Array(numBytes).fill(0);
  }

  setAllFlags() {
    for (let i = 0; i < this.numBytes; i++) {
      this.letterMap[i] = BIT_ALL_MASK;
    }
    removeHeadBits(this.letterMap[this.letterMap.length - 1], this.ignoreBits);
    return this;
  }

  setNoneFlags() {
    for (let i = 0; i < this.numBytes; i++) {
      this.letterMap[i] = BIT_NONE_MASK;
    }
    return this;
  }

  getBit(p1: number, p2: number): boolean {
    return (this.letterMap[p1] & BIT_MASK[p2]) > 0;
  }

  setBit(p1: number, p2: number) {
    this.letterMap[p1] = this.letterMap[p1] | BIT_MASK[p2];
    return this;
  }

  unsetBit(p1: number, p2: number) {
    this.letterMap[p1] = this.letterMap[p1] & FLIP_BIT_MASK[p2];
  }

  filterMask(mask: FlagsBucket) {
    for (let i = 0; i < this.letterMap.length; i++) {
      if ((this.letterMap[i] & mask.letterMap[i]) !== mask.letterMap[i]) {
        return false;
      }
    }
    return true;
  }

  filterNotMask(mask: FlagsBucket) {
    for (let i = 0; i < this.letterMap.length; i++) {
      if ((this.letterMap[i] & mask.letterMap[i]) > 0) {
        return false;
      }
    }
    return true;
  }

  debug() {
    let str = "";
    for (let i = 0; i < this.letterMap.length; i++) {
      str += (this.letterMap[i] >>> 0).toString(2).padStart(8, "0") + " ";
    }
    console.log(str);
  }
}
