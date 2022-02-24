export function flipByte(byte: number) {
  return ((~byte << 24) >> 24) >>> 0;
}

export function removeHeadBits(byte: number, bits: number) {
  return byte & UNSET_FIRST_N_BIT_MASK[bits - 1];
}

export const BIT_ALL_MASK = 0b11111111;
export const BIT_NONE_MASK = 0b00000000;

export const BIT_MASK = [0b00000001, 0b00000010, 0b00000100, 0b00001000, 0b00010000, 0b00100000, 0b01000000, 0b10000000];
export const FLIP_BIT_MASK = BIT_MASK.map((_) => flipByte(_));

export const UNSET_FIRST_N_BIT_MASK = [0b01111111, 0b00111111, 0b00011111, 0b00001111, 0b00000111, 0b00000011, 0b00000001, 0b00000000];
