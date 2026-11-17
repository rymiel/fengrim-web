import { ApiWord, DerivedFields, LangConfigData } from "@rymiel/conlang-web-components";

import { Part, partOfExtra } from "./extra";

declare module "@rymiel/conlang-web-components" {
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

export function deriveFields(lang: LangConfigData, word: ApiWord): DerivedFields {
  const part = partOfExtra(word.extra);
  const ipa = lang.ipa(word.sol);
  const phon = lang.syllable.ipa(word.sol);
  const disp = displayWord(word);
  return { part, ipa, phon, disp };
}
