import { ApiData, entrySort, prefixSplit, uri } from "conlang-web-components";

import { FullEntry } from "providers/dictionary";
import { LangConfigData } from "providers/langConfig";

import { partOfExtra } from "./extra";

type ApiDictionary = Pick<ApiData, "words" | "meanings" | "sections">;

function displayWord({ extra, sol }: { extra: string; sol: string }): string {
  if (extra === "root") {
    return `√${sol}`;
  } else {
    return sol;
  }
}

export function transformDictionary(lang: LangConfigData, d: ApiDictionary): FullEntry[] {
  const mMeanings = d.meanings.map((meaning) => {
    const [prefix, eng] = prefixSplit(meaning.eng);
    const sections = meaning.sections.map((s) => d.sections.find((j) => j.hash === s)!);
    return { ...meaning, eng, prefix, sections };
  });
  const mWords = d.words
    .map((word) => {
      const part = partOfExtra(word.extra);
      const ipa = lang.ipa(word.sol);
      const phon = lang.syllable.ipa(word.sol);
      const sections = word.sections.map((s) => d.sections.find((j) => j.hash === s)!);
      const meanings = word.meanings.map((s) => mMeanings.find((j) => j.hash === s)!);
      const disp = displayWord(word);
      return { ...word, part, ipa, phon, sections, meanings, disp };
    })
    .sort(entrySort);
  return mWords.map((word, idx) => {
    const matching = mWords.filter((j) => j.sol === word.sol);
    const link = matching.length === 1 ? uri`/w/${word.sol}` : uri`/w/${word.sol}/${matching.indexOf(word) + 1}`;
    return { ...word, link, index: idx + 1 };
  });
}
