import { GuessResult, GuessResultEvaluator } from "../guess/GuessResultEvaluator.js";
import { ResultType } from "../guess/ResultType.js";
import { LetterFlagMask } from "../mask/LetterFlagMask.js";
import { sleep } from "../util/sleep.js";
import { Word } from "../word/Word.js";
import { GameInteraction } from "./GameInteraction.js";

export class GameGuessResultEvaluator implements GuessResultEvaluator {
  answer() {
    return null;
  }

  async evaluateGuess(guessWord: Word): Promise<GuessResult> {
    await GameInteraction.makeGuess(guessWord);
    await sleep(50);
    const evaluations = GameInteraction.getEvaluations().filter((_) => _);
    const lastEvaluation = evaluations[evaluations.length - 1]!;

    const wordLength = guessWord.word.length;
    const greenSlots = new Array(wordLength).fill(false);
    const yellowSlots = new Array(wordLength).fill(false);

    for (let i = 0; i < wordLength; i++) {
      if (lastEvaluation[i] === "correct") {
        greenSlots[i] = true;
      }
    }
    for (let i = 0; i < wordLength; i++) {
      if (lastEvaluation[i] === "present") {
        yellowSlots[i] = true;
      }
    }

    const result = new GuessResult({
      success: greenSlots.filter((_) => _).length == wordLength,
      slot: new Array(wordLength).fill(null).map((_, i) => {
        return (greenSlots[i] && ResultType.GREEN) || (yellowSlots[i] && ResultType.YELLOW) || ResultType.GREY;
      }),
      text: guessWord.word
        .split("")
        .map((char, i) => {
          return (greenSlots[i] && char + "!") || (yellowSlots[i] && char + "?") || char;
        })
        .join(""),
    });

    return result;
  }
}
