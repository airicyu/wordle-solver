import { Word } from "./../word/Word.js";

/**
[
  CharScore { char: 'e', score: 1057 },
  CharScore { char: 'a', score: 909 },
  CharScore { char: 'r', score: 837 },
  CharScore { char: 'o', score: 674 },
  CharScore { char: 't', score: 668 },
  CharScore { char: 'l', score: 648 },
  CharScore { char: 'i', score: 647 },
  CharScore { char: 's', score: 619 },
  CharScore { char: 'n', score: 550 },
  CharScore { char: 'u', score: 457 },
  CharScore { char: 'c', score: 448 },
  CharScore { char: 'y', score: 417 },
  CharScore { char: 'h', score: 379 },
  CharScore { char: 'd', score: 370 },
  CharScore { char: 'p', score: 347 },
  CharScore { char: 'g', score: 300 },
  CharScore { char: 'm', score: 298 },
  CharScore { char: 'b', score: 267 },
  CharScore { char: 'f', score: 207 },
  CharScore { char: 'k', score: 202 },
  CharScore { char: 'w', score: 194 },
  CharScore { char: 'v', score: 149 },
  CharScore { char: 'x', score: 37 },
  CharScore { char: 'z', score: 35 },
  CharScore { char: 'q', score: 29 },
  CharScore { char: 'j', score: 27 }
]
 */

// [
//   CharScore { char: 's', score: 2674 },
//   CharScore { char: 'e', score: 2658 },
//   CharScore { char: 'a', score: 2181 },
//   CharScore { char: 'r', score: 1799 },
//   CharScore { char: 'o', score: 1683 },
//   CharScore { char: 'i', score: 1539 },
//   CharScore { char: 't', score: 1462 },
//   CharScore { char: 'l', score: 1434 },
//   CharScore { char: 'n', score: 1219 },
//   CharScore { char: 'd', score: 1100 },
//   CharScore { char: 'u', score: 1068 },
//   CharScore { char: 'c', score: 920 },
//   CharScore { char: 'p', score: 895 },
//   CharScore { char: 'y', score: 868 },
//   CharScore { char: 'm', score: 794 },
//   CharScore { char: 'h', score: 791 },
//   CharScore { char: 'b', score: 669 },
//   CharScore { char: 'g', score: 651 },
//   CharScore { char: 'k', score: 574 },
//   CharScore { char: 'f', score: 502 },
//   CharScore { char: 'w', score: 501 },
//   CharScore { char: 'v', score: 309 },
//   CharScore { char: 'x', score: 138 },
//   CharScore { char: 'z', score: 121 },
//   CharScore { char: 'j', score: 88 },
//   CharScore { char: 'q', score: 53 }
// ]

export class CharScore {
  char: string;
  score: number;

  constructor(char: string, score: number) {
    this.char = char;
    this.score = score;
  }
}

const charScoresCache = new Map<Word[], CharScore[]>();

export const getCharScoresWithCache = (dictionary: Word[]): CharScore[] => {
  const cacheValue = charScoresCache.get(dictionary);
  if (cacheValue) {
    return cacheValue;
  }
  const charScores = getCharScores(dictionary);
  charScoresCache.set(dictionary, charScores);
  return charScores;
};

export const getCharScores = (dictionary: Word[]): CharScore[] => {
  const charCountMap: Record<string, number> = {};

  dictionary.forEach((word) => {
    let chars = new Set<string>();
    for (let char of word.word) {
      chars.add(char);
    }
    for (let char of chars) {
      charCountMap[char] = charCountMap[char] ?? 0;
      charCountMap[char]++;
    }
  });

  const charCountEntries = Object.entries(charCountMap);
  charCountEntries.sort((a, b) => b[1] - a[1]);

  const charScores = charCountEntries.map((_) => new CharScore(_[0], _[1]));
  return charScores;
};

export const getCharScoreMap = (dictionary: Word[]): Record<string, number> => {
  const charScores = getCharScoresWithCache(dictionary);
  const charScoreMap: Record<string, number> = {};

  charScores.forEach((charScore) => {
    charScoreMap[charScore.char] = charScore.score;
  });

  return charScoreMap;
};
