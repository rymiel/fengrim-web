import { ApiData, ApiWord, entrySort, prefixSplit, uri } from "conlang-web-components";

import { FullEntry, OptionalEntryFields } from "providers/dictionary";
import { LangConfigData } from "providers/langConfig";

import { Part, partOfExtra } from "./extra";

type ApiDictionary = Pick<ApiData, "words" | "meanings" | "sections">;

export interface LangEntryFields extends OptionalEntryFields {
  part: Part | null;
  phon: string;
}

function displayWord({ extra, sol }: { extra: string; sol: string }): string {
  if (extra === "root") {
    return `√${sol}`;
  } else {
    return sol;
  }
}

function deriveFields(lang: LangConfigData, word: ApiWord) {
  const part = partOfExtra(word.extra);
  const ipa = lang.ipa(word.sol);
  const phon = lang.syllable.ipa(word.sol);
  const disp = displayWord(word);
  return { part, ipa, phon, disp };
}

export function transformDictionary(lang: LangConfigData, d: ApiDictionary): FullEntry[] {
  const mMeanings = d.meanings.map((meaning) => {
    const [prefix, eng] = prefixSplit(meaning.eng);
    const sections = meaning.sections.map((s) => d.sections.find((j) => j.hash === s)!);
    return { ...meaning, eng, prefix, sections };
  });
  const mWords = d.words
    .map((word) => {
      const sections = word.sections.map((s) => d.sections.find((j) => j.hash === s)!);
      const meanings = word.meanings.map((s) => mMeanings.find((j) => j.hash === s)!);
      return { ...word, ...deriveFields(lang, word), sections, meanings };
    })
    .sort(entrySort);
  return mWords.map((word, idx) => {
    const matching = mWords.filter((j) => j.sol === word.sol);
    const link = matching.length === 1 ? uri`/w/${word.sol}` : uri`/w/${word.sol}/${matching.indexOf(word) + 1}`;
    return { ...word, link, index: idx + 1 };
  });
}
