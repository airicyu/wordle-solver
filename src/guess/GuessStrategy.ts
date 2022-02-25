import { getCharScoreMap } from "./../dictionary/DictionaryInfo.js";
import { LetterFlagMask } from "../mask/LetterFlagMask.js";
import { LetterPosFlagMask } from "../mask/LetterPosFlagMask.js";
import { DictionaryFilter } from "../dictionary/DictionaryFilter.js";
import { Word } from "./../word/Word.js";
import { WordInfo } from "./../word/WordInfo.js";

export abstract class GuessStrategy {
  protected dictionary: Word[];
  protected scoreMap: Record<string, number>;

  static strategyName = "default";

  constructor(dictionary: Word[], scoreMap?: Record<string, number>) {
    this.dictionary = dictionary;
    this.scoreMap = scoreMap ?? getCharScoreMap(dictionary);
  }

  setDictionary(dictionary: Word[]) {
    this.dictionary = dictionary;
  }

  setScoreMap(scoreMap: Record<string, number>) {
    this.scoreMap = scoreMap;
  }

  abstract suggestGuess(wordInfo: WordInfo): Word[];

  protected evaluateScore(
    dictionary: Word[],
    scoreMap: Record<string, number>
  ): {
    word: Word;
    score: number;
  }[] {
    const wordScores = dictionary.map((word) => {
      let score = 0;
      word.getCharSet().forEach((char) => {
        score += scoreMap[char] ?? 0;
      });
      return { word, score };
    });

    wordScores.sort((a, b) => {
      return b.score - a.score;
    });

    return wordScores;
  }
}

export class AggressiveExpandCharGuessStrategy extends GuessStrategy {
  static strategyName = "aggressive";

  constructor(dictionary: Word[], scoreMap?: Record<string, number>) {
    super(dictionary, scoreMap);
  }

  suggestGuess(wordInfo: WordInfo) {
    const filteredResult = DictionaryFilter.filter(
      this.dictionary,
      new WordInfo(
        wordInfo.wordLength,
        new LetterFlagMask(),
        new LetterFlagMask().chars(wordInfo.letterMask.getChars() + wordInfo.letterNotMask.getChars()),
        new LetterPosFlagMask(wordInfo.wordLength),
        new LetterPosFlagMask(wordInfo.wordLength)
      )
    );

    const scoreMap = JSON.parse(JSON.stringify(this.scoreMap));
    for (const char of wordInfo.letterMask.getChars()) {
      scoreMap[char] = 0;
    }
    for (const char of wordInfo.letterNotMask.getChars()) {
      scoreMap[char] = 0;
    }

    const wordScores = this.evaluateScore(filteredResult, scoreMap).filter((_) => _.score > 0);
    return wordScores.map((_) => _.word);
  }
}

export class ExpandCharGuessStrategy extends GuessStrategy {
  static strategyName = "expand";

  constructor(dictionary: Word[], scoreMap?: Record<string, number>) {
    super(dictionary, scoreMap);
  }

  suggestGuess(wordInfo: WordInfo) {
    const filteredResult = DictionaryFilter.filter(
      this.dictionary,
      new WordInfo(
        wordInfo.wordLength,
        new LetterFlagMask(),
        new LetterFlagMask().chars(wordInfo.letterNotMask.getChars()),
        new LetterPosFlagMask(wordInfo.wordLength),
        new LetterPosFlagMask(wordInfo.wordLength)
      )
    );

    const scoreMap = JSON.parse(JSON.stringify(this.scoreMap));
    for (const char of wordInfo.letterMask.getChars()) {
      scoreMap[char] = 0;
    }
    for (const char of wordInfo.letterNotMask.getChars()) {
      scoreMap[char] = 0;
    }

    const wordScores = this.evaluateScore(filteredResult, scoreMap);
    return wordScores.map((_) => _.word);
  }
}

export class DistinctCharGuessStrategy extends GuessStrategy {
  static strategyName = "distinct";

  constructor(dictionary: Word[], scoreMap?: Record<string, number>) {
    super(dictionary, scoreMap);
  }

  suggestGuess(wordInfo: WordInfo) {
    const filteredResult = DictionaryFilter.filter(this.dictionary, wordInfo);
    const scoreMap = JSON.parse(JSON.stringify(this.scoreMap)) as Record<string, number>;
    for (const char of wordInfo.letterMask.getChars()) {
      if (wordInfo.letterNotPosMask.getCharSet().has(char)) {
        scoreMap[char] = 0;
      } else {
        scoreMap[char] = 0;
      }
    }
    for (const char of wordInfo.letterNotMask.getChars()) {
      scoreMap[char] = 0;
    }

    for (const [char, score] of Object.entries(scoreMap)) {
      if (score === filteredResult.length) {
        scoreMap[char] = 0;
      }
    }

    // if (filteredResult.length < 4) {
    //   for (const [char, score] of Object.entries(scoreMap)) {
    //     if (scoreMap[char] != 0) {
    //       scoreMap[char] = 1 / score;
    //     }
    //   }
    // }

    if (Object.values(scoreMap).filter((_) => _ != 0).length === 0) {
      return [];
    }

    const wordScores = this.evaluateScore(this.dictionary, scoreMap).filter((_) => _.score > 0);
    return wordScores.map((_) => _.word);
  }
}

// export class SimulateGuessStrategy extends GuessStrategy {
//   static strategyName = "simulate";
//   trialChance : number

//   constructor(trialChance: number, dictionary: Word[], scoreMap?: Record<string, number>) {
//     super(dictionary, scoreMap);
//     this.trialChance = trialChance
//   }

//   suggestGuess(wordInfo: WordInfo) {
//     const filteredResult = DictionaryFilter.filter(this.dictionary, wordInfo);

//     for(let simAns)

//     const wordScores = this.evaluateScore(this.dictionary, scoreMap).filter((_) => _.score > 0);
//     return wordScores.map((_) => _.word);
//   }
// }

export class MatchGuessStrategy extends GuessStrategy {
  static strategyName = "match";

  constructor(dictionary: Word[], scoreMap?: Record<string, number>) {
    super(dictionary, scoreMap);
  }

  suggestGuess(wordInfo: WordInfo) {
    const filteredResult = DictionaryFilter.filter(this.dictionary, wordInfo);

    const scoreMap = JSON.parse(JSON.stringify(this.scoreMap));

    const wordScores = this.evaluateScore(filteredResult, scoreMap);
    return wordScores.map((_) => _.word);
  }
}
