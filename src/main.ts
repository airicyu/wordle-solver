import { GameInteraction } from "./game/GameInteraction.js";
import { fullDictionaryWords } from "./dictionary/loadDictData.js";
import { Word } from "./word/Word.js";
import { DevGuessResultEvaluator, GuessResultEvaluator } from "./guess/GuessResultEvaluator.js";
import { GuessEngine } from "./guess/GuessEngine.js";
import { WordInfo } from "./word/WordInfo.js";
import { LetterFlagMask } from "./mask/LetterFlagMask.js";
import { LetterPosFlagMask } from "./mask/LetterPosFlagMask.js";
import { WordFilter } from "./word/WordFilter.js";

if (!globalThis.window) {
  globalThis.window = globalThis.window ?? {};
}
(globalThis.window as any).GameInteraction = GameInteraction;
GameInteraction.run();

const WORD_LENGTH = 5;

const dictionary5Letter = fullDictionaryWords.filter((_) => _.length === WORD_LENGTH).map((_) => new Word(_));

// let wordInfo = new WordInfo(
//   WORD_LENGTH,
//   new LetterFlagMask().chars("id"),
//   new LetterFlagMask().chars("latershnypoun"),
//   new LetterPosFlagMask(WORD_LENGTH).charAtPos("d", 4),
//   new LetterPosFlagMask(WORD_LENGTH).charAtPos("i", 2)
// );

// console.log(WordFilter.filter(dictionary5Letter, wordInfo).map((_) => _.word));

// const guessResultEvaluator = new DevGuessResultEvaluator(new Word("vivid"));
// const guessEngine = new GuessEngine(dictionary5Letter, WORD_LENGTH, guessResultEvaluator);
// guessEngine.run();

// const randomWord = dictionary5Letter[Math.round(dictionary5Letter.length * 100 * Math.random()) % dictionary5Letter.length];
// const guessResultEvaluator = new DevGuessResultEvaluator(randomWord);
// const guessEngine = new GuessEngine(dictionary5Letter, WORD_LENGTH, guessResultEvaluator);
// guessEngine.run();

// const challenges = ["water", "wooer", "jaunt", "catch", "taunt", "booby", "bobby", "retro"].map((_) => new Word(_));
// // const challenges = ["staff"].map((_) => new Word(_));
// // const challenges = dictionary5Letter;

// let successCounter = 0;
// for (let [i, word] of challenges.entries()) {
//   const guessResultEvaluator = new DevGuessResultEvaluator(word);
//   const guessEngine = new GuessEngine(dictionary5Letter, WORD_LENGTH, guessResultEvaluator);
//   console.log(i, word.word);
//   const result = await guessEngine.run();
//   if (!result.success) {
//     console.log(`failed at ${i}`);
//     break;
//   } else {
//     successCounter++;
//   }
// }
// console.log(`${successCounter} over ${challenges.length} success. Success rate = ${((successCounter / challenges.length) * 100).toFixed(2)}%`);

