export class BitMasks {
  static flagPosCache: Record<number, Record<string, [number, number]>> = {};

  static calFlagPos(charIndex: number, char: string) {
    if (BitMasks.flagPosCache[charIndex]?.[char]) {
      return BitMasks.flagPosCache[charIndex]?.[char];
    }
    const index = charIndex * 26 + (char.charCodeAt(0) - 97);

    const positions: [number, number] = [~~(index / 8), index % 8];
    BitMasks.flagPosCache[charIndex] = BitMasks.flagPosCache[charIndex] ?? {};
    BitMasks.flagPosCache[charIndex][char] = positions;
    return positions;
  }
}
