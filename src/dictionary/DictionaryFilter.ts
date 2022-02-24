import { Word } from "./../word/Word.js";
import { WordInfo } from "./../word/WordInfo.js";

export class DictionaryFilter {
  static filter(dictionary: Word[], wordInfo: WordInfo): Word[] {
    let letterMask = wordInfo.letterMask;
    let letterNotMask = wordInfo.letterNotMask;
    let letterPosMask = wordInfo.letterPosMask;
    let letterNotPosMask = wordInfo.letterNotPosMask;

    return dictionary.filter((word) => {
      let result =
        word.filterLetter(letterMask) &&
        word.filterLetterNot(letterNotMask) &&
        word.filterLetterPos(letterPosMask) &&
        word.filterLetterNotPos(letterNotPosMask);

      return result;
    });
  }
}
