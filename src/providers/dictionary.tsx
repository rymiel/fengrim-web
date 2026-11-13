import { ApiMeaning, ApiSection, ApiWord } from "conlang-web-components";
import { createContext } from "react";

import { LangEntryFields } from "lang/dictionary";

export interface OptionalEntryFields {
  /** Phonemic IPA transcription (broad) / ... / */
  phon?: string;
  script?: string;
  class?: string | null;
}

export interface FullEntry extends Omit<ApiWord, "meanings" | "sections">, LangEntryFields {
  disp: string;
  /** Phonetic IPA transcription (narrow) [ ... ] */
  ipa: string;
  link: string;
  index: number;

  meanings: FullMeaning[];
  sections: FullSection[];
}

export interface FullMeaning extends Omit<ApiMeaning, "sections"> {
  prefix?: string;
  sections: FullSection[];
}

export interface FullSection extends ApiSection {}

interface DictionaryData {
  entries: readonly FullEntry[] | null;
  refresh: () => Promise<void>;
}

export const Dictionary = createContext<DictionaryData>({
  entries: null,
  refresh: () => {
    throw new Error("No dictionary context provided");
  },
});
