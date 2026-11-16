import { ApiWord, createTransformDictionary, DerivedFields, LangConfigData } from "conlang-web-components";

import { Part, partOfExtra } from "./extra";

declare module "conlang-web-components" {
  interface LangEntryFields {
    part: Part | null;
    phon: string;
  }
}

function displayWord({ extra, sol }: { extra: string; sol: string }): string {
  if (extra === "root") {
    return `√${sol}`;
  } else {
    return sol;
  }
}

function deriveFields(lang: LangConfigData, word: ApiWord): DerivedFields {
  const part = partOfExtra(word.extra);
  const ipa = lang.ipa(word.sol);
  const phon = lang.syllable.ipa(word.sol);
  const disp = displayWord(word);
  return { part, ipa, phon, disp };
}

export const transformDictionary = createTransformDictionary(deriveFields);
