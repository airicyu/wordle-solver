import { GuessResult } from "../guess/GuessResultEvaluator.js";
import { sleep } from "../util/sleep.js";
import { Word } from "../word/Word.js";
import { GameGuessResultEvaluator } from "./GameGuessResultEvaluator.js";
import { KeyboardInput } from "./KeyboardInput.js";
import { fullDictionaryWords } from "./../dictionary/loadDictData.js";
import { GuessEngine } from "../guess/GuessEngine.js";

export class GameInteraction {
  // static app: any;

  static async run() {
    const WORD_LENGTH = 5;
    const dictionary5Letter = fullDictionaryWords.filter((_) => _.length === WORD_LENGTH).map((_) => new Word(_));
    const guessResultEvaluator = new GameGuessResultEvaluator();
    const guessEngine = new GuessEngine(dictionary5Letter, WORD_LENGTH, guessResultEvaluator);
    await guessEngine.run();
  }

  static async makeGuess(word: Word) {
    for (let i = 0; i < word.word.length; i++) {
      KeyboardInput.sendChar(word.word[i]);
      await sleep(10);
    }
    KeyboardInput.sendEnter();
    await sleep(2000);
  }

  static getApp() {
    // if (!GameInteraction.app) {
    //   GameInteraction.app = new window.wordle.bundle.GameApp();
    // }
    return new window.wordle.bundle.GameApp();
  }

  static getEvaluations(): (string[] | null)[] {
    return GameInteraction.getApp().evaluations;
  }

  static getBroadState(): string[] {
    return GameInteraction.getApp().boardState;
  }
}
