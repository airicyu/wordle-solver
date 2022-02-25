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
  private remainWords: Word[];

  constructor(dictionary: Word[], wordLength: number, guessResultEvaluator: GuessResultEvaluator) {
    this.dictionary = dictionary;
    this.remainWords = dictionary;
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

    this.remainWords = new MatchGuessStrategy(this.remainWords).suggestGuess(wordInfo);
    let remainWordsScoreMap = getCharScoreMap(this.remainWords);

    // let aggressiveCandidates = new AggressiveExpandCharGuessStrategy(this.dictionary, remainWordsScoreMap).suggestGuess(wordInfo);
    let distinctCandidates = new DistinctCharGuessStrategy(this.dictionary, remainWordsScoreMap).suggestGuess(wordInfo);
    let matchCandidates = new MatchGuessStrategy(this.dictionary, remainWordsScoreMap).suggestGuess(wordInfo);

    if (trial == 1) {
      // 1st trial
      strategy = AggressiveExpandCharGuessStrategy;
    } else if (wordInfo.letterMask.getChars().length == 5) {
      // already got 5 letters
      strategy = MatchGuessStrategy;
    } else if (this.remainWords.length <= 6 - trial + 1) {
      // got fews word candidates
      strategy = MatchGuessStrategy;
    } else if (trial == 2) {
      // 2nd trial && not enough letter info
      // if (wordInfo.letterMask.getChars().length < 4 && aggressiveCandidates.length > 0) {
      //   strategy = AggressiveExpandCharGuessStrategy;
      // } else {
      //   strategy = DistinctCharGuessStrategy;
      // }
      strategy = DistinctCharGuessStrategy;
    } else if (trial == 3) {
      if (wordInfo.letterMask.getChars().length < 5) {
        strategy = DistinctCharGuessStrategy;
      } else {
        strategy = MatchGuessStrategy;
      }
    } else if (trial == 4) {
      if (wordInfo.letterMask.getChars().length < 5) {
        strategy = DistinctCharGuessStrategy;
      } else {
        strategy = MatchGuessStrategy;
      }
    } else if (trial == 5) {
      strategy = DistinctCharGuessStrategy;
    } else {
      strategy = MatchGuessStrategy;
    }

    guessWords = new strategy(this.dictionary, remainWordsScoreMap).suggestGuess(wordInfo);
    guessWord = guessWords[0];

    if (!guessWord || this.guessRecords.map((_) => _.guess).includes(guessWord.word)) {
      strategy = MatchGuessStrategy;
      guessWords = new MatchGuessStrategy(this.dictionary, remainWordsScoreMap).suggestGuess(wordInfo);
      guessWord = guessWords[0];
    }

    // let logs = ""; //`${aggressiveCandidates.length} ${distinctCandidates.length} ${matchCandidates.length}\n`;
    let logs = `${distinctCandidates.length} ${matchCandidates.length}\n`;
    // let logs = "";
    logs +=
      "first 10 remaining: " +
      matchCandidates
        .slice(0, 10)
        .map((_) => _.word)
        .join(",") +
      "\n";
    guessResult = await this.guessResultEvaluator.evaluateGuess(guessWord);

    return {
      trial,
      strategy: strategy.strategyName,
      guess: guessWord.word,
      result: guessResult,
      logs,
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
    let logs = "";

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

      logs += guessRecord.logs;

      //console.log(`t${guessRecord.trial} strategy: ${guessRecord.strategy.name}, guess: "${guessRecord.guess}", result: `, guessRecord.result);
      logs +=
        JSON.stringify(
          { trial: guessRecord.trial, strategy: guessRecord.strategy, guess: guessRecord.guess, result: guessRecord.result.text },
          null,
          2
        ) +
        "\n" +
        `chars: ${wordInfo.letterMask.getChars()}, noChars: ${wordInfo.letterNotMask.getChars()}\n` +
        `remaining: ${LetterFlagMask.charA2Z
          .split("")
          .filter((char) => !wordInfo.letterMask.getChars().includes(char) && !wordInfo.letterNotMask.getChars().includes(char))
          .join("")}`;

      logs += "\n------------------\n";

      if (guessRecord.result.success) {
        break;
      }
    }

    const lastGuessRecord = this.getLastGuessRecord();
    if (lastGuessRecord.result.success) {
      logs += `Bingo! Guess with ${lastGuessRecord.trial} times!`;
      console.log(logs);
      return { success: true, answer: this.guessResultEvaluator.answer()?.word, logs };
    } else {
      logs += `Failed to guess with 6 times! Answer is '${this.guessResultEvaluator.answer()?.word}'.`;
      console.log(logs);
      return { success: false, answer: this.guessResultEvaluator.answer()?.word, logs };
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
        logs: "",
      });
    }

    return {
      nextTrial,
      guessRecords,
      wordInfo,
    };
  }
}

export type GuessRecord = { trial: number; strategy: string; guess: string; result: GuessResult; logs: string };
