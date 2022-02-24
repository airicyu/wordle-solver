import { LetterFlagMask } from "../mask/LetterFlagMask.js";
import { LetterPosFlagMask } from "../mask/LetterPosFlagMask.js";
import { Word } from "../word/Word.js";
import { WordInfo } from "../word/WordInfo.js";
import { GuessResultEvaluator } from "./GuessResultEvaluator.js";
import { GuessResult } from "./GuessResultEvaluator.js";
import { AggressiveExpandCharGuessStrategy, ExpandCharGuessStrategy, MatchGuessStrategy, DistinctCharGuessStrategy } from "./GuessStrategy.js";
import { ResultType } from "./ResultType.js";
import { getCharScoreMap } from "../dictionary/DictionaryInfo.js";
import { GameInteraction } from "../game/GameInteraction.js";

export class GuessEngine {
  private dictionary: Word[];
  private wordLength: number;
  private guessResultEvaluator: GuessResultEvaluator;
  private guessRecords: GuessRecord[] = [];

  constructor(dictionary: Word[], wordLength: number, guessResultEvaluator: GuessResultEvaluator) {
    this.dictionary = dictionary;
    this.wordLength = wordLength;
    this.guessResultEvaluator = guessResultEvaluator;
  }

  getLastGuessRecord() {
    return this.guessRecords[this.guessRecords.length - 1];
  }

  async runTrial(trial: number, wordInfo: WordInfo): Promise<GuessRecord> {
    let strategy = MatchGuessStrategy;
    let guessWords = null;
    let guessWord = null;
    let guessResult = null;

    let remainWords = new MatchGuessStrategy(this.dictionary).suggestGuess(wordInfo);
    let remainWordsScoreMap = getCharScoreMap(remainWords);

    let aggressiveCandidates = new AggressiveExpandCharGuessStrategy(this.dictionary, remainWordsScoreMap).suggestGuess(wordInfo);
    let expandCandidates = new ExpandCharGuessStrategy(this.dictionary, remainWordsScoreMap).suggestGuess(wordInfo);
    let matchCandidates = new MatchGuessStrategy(this.dictionary, remainWordsScoreMap).suggestGuess(wordInfo);

    if (trial == 1) {
      // 1st trial
      strategy = AggressiveExpandCharGuessStrategy;
    } else if (wordInfo.letterMask.getChars().length == 5) {
      // already got 5 letters
      strategy = MatchGuessStrategy;
    } else if (remainWords.length <= 6 - trial + 1) {
      // got fews word candidates
      strategy = MatchGuessStrategy;
    } else if (trial == 2) {
      // 2nd trial && not enough letter info
      strategy = wordInfo.letterMask.getChars().length < 4 ? AggressiveExpandCharGuessStrategy : ExpandCharGuessStrategy;
    } else if (trial == 3) {
      // 3rd trial && not enough letter info
      strategy = wordInfo.letterMask.getChars().length < 4 ? AggressiveExpandCharGuessStrategy : ExpandCharGuessStrategy;
    } else if (trial == 4) {
      // 4th trial
      if (remainWords.length < 10) {
        strategy = DistinctCharGuessStrategy;
      } else {
        strategy = wordInfo.letterMask.getChars().length < 4 ? AggressiveExpandCharGuessStrategy : DistinctCharGuessStrategy;
      }
    } else if (trial == 5) {
      // 5th trial
      strategy = DistinctCharGuessStrategy;
    } else if (trial < 6 && wordInfo.letterMask.getChars().length <= 4 && remainWords.length >= 2) {
      strategy = MatchGuessStrategy;
    }

    guessWords = new strategy(this.dictionary, remainWordsScoreMap).suggestGuess(wordInfo);
    guessWord = guessWords[0];

    if (!guessWord) {
      strategy = MatchGuessStrategy;
      guessWords = new MatchGuessStrategy(this.dictionary, remainWordsScoreMap).suggestGuess(wordInfo);
      guessWord = guessWords[0];
    }

    console.log(aggressiveCandidates.length, expandCandidates.length, matchCandidates.length);
    console.log("first 10 remaining: " + matchCandidates.slice(0, 10));
    guessResult = await this.guessResultEvaluator.evaluateGuess(guessWord);

    return {
      trial,
      strategy: strategy.strategyName,
      guess: guessWord.word,
      result: guessResult,
    };
  }

  async run() {
    let nextTrial = 1;
    let wordInfo = new WordInfo(
      this.wordLength,
      new LetterFlagMask(),
      new LetterFlagMask(),
      new LetterPosFlagMask(this.wordLength),
      new LetterPosFlagMask(this.wordLength)
    );

    try {
      let preloadContext = this.preloadFromWeb();
      nextTrial = preloadContext.nextTrial;
      this.guessRecords = preloadContext.guessRecords;
      wordInfo = preloadContext.wordInfo;
    } catch (e) {}

    for (let i = nextTrial; i <= 6; i++) {
      const guessRecord = await this.runTrial(i, wordInfo);
      this.guessRecords.push(guessRecord);

      // update word info
      for (let [i, char] of guessRecord.guess.split("").entries()) {
        if (guessRecord.result.slot[i] == ResultType.GREEN) {
          wordInfo.letterMask.chars(char);
          wordInfo.letterPosMask.charAtPos(char, i);
        } else if (guessRecord.result.slot[i] == ResultType.YELLOW) {
          wordInfo.letterMask.chars(char);
          wordInfo.letterNotPosMask.charAtPos(char, i);
        } else {
          wordInfo.letterNotMask.chars(char);
        }
      }

      //console.log(`t${guessRecord.trial} strategy: ${guessRecord.strategy.name}, guess: "${guessRecord.guess}", result: `, guessRecord.result);
      console.log(
        guessRecord,
        `chars: ${wordInfo.letterMask.getChars()}, noChars: ${wordInfo.letterNotMask.getChars()}`,
        `remaining: ${LetterFlagMask.charA2Z
          .split("")
          .filter((char) => !wordInfo.letterMask.getChars().includes(char) && !wordInfo.letterNotMask.getChars().includes(char))
          .join("")}`
      );

      console.log("------------------");

      if (guessRecord.result.success) {
        break;
      }
    }

    const lastGuessRecord = this.getLastGuessRecord();
    if (lastGuessRecord.result.success) {
      console.log(`Bingo! Guess with ${lastGuessRecord.trial} times!`);
      return true;
    } else {
      console.log(`Failed to guess with 6 times! Answer is '${this.guessResultEvaluator.answer()?.word}'.`);
      return false;
    }
  }

  preloadFromWeb() {
    const evaluations = GameInteraction.getEvaluations();
    const broadState = GameInteraction.getBroadState();
    const nextTrial = evaluations.filter((_) => _ !== null).length + 1;
    const guessRecords: GuessRecord[] = [];

    const wordInfo = new WordInfo(
      this.wordLength,
      new LetterFlagMask(),
      new LetterFlagMask(),
      new LetterPosFlagMask(this.wordLength),
      new LetterPosFlagMask(this.wordLength)
    );

    for (let j = 0; j < nextTrial; j++) {
      const guessWord = new Word(broadState[j]);

      const greenSlots = new Array(this.wordLength).fill(false);
      const yellowSlots = new Array(this.wordLength).fill(false);

      for (let i = 0; i < this.wordLength; i++) {
        if (evaluations[j]?.[i] === "correct") {
          greenSlots[i] = true;
        }
      }
      for (let i = 0; i < this.wordLength; i++) {
        if (evaluations[j]?.[i] === "present") {
          yellowSlots[i] = true;
        }
      }

      const result = new GuessResult({
        success: greenSlots.filter((_) => _).length == this.wordLength,
        slot: new Array(this.wordLength).fill(null).map((_, i) => {
          return (greenSlots[i] && ResultType.GREEN) || (yellowSlots[i] && ResultType.YELLOW) || ResultType.GREY;
        }),
        text: guessWord.word
          .split("")
          .map((char, i) => {
            return (greenSlots[i] && char + "!") || (yellowSlots[i] && char + "?") || char;
          })
          .join(""),
      });

      for (let [i, char] of guessWord.word.split("").entries()) {
        if (result.slot[i] == ResultType.GREEN) {
          wordInfo.letterMask.chars(char);
          wordInfo.letterPosMask.charAtPos(char, i);
        } else if (result.slot[i] == ResultType.YELLOW) {
          wordInfo.letterMask.chars(char);
          wordInfo.letterNotPosMask.charAtPos(char, i);
        } else {
          wordInfo.letterNotMask.chars(char);
        }
      }

      guessRecords.push({
        trial: j + 1,
        strategy: "unknown",
        guess: guessWord.word,
        result,
      });
    }

    return {
      nextTrial,
      guessRecords,
      wordInfo,
    };
  }
}

export type GuessRecord = { trial: number; strategy: string; guess: string; result: GuessResult };
