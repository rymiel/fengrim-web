import { ApiMeaning, ApiSection, ApiWord } from "conlang-web-components";
import { createContext } from "react";

import { Part } from "lang/extra";

export interface FullEntry extends Omit<ApiWord, "meanings" | "sections"> {
  part: Part | null;
  ipa: string;
  link: string;
  disp: string;
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
  entries: FullEntry[] | null;
  refresh: () => void;
}

export const Dictionary = createContext<DictionaryData>({
  entries: null,
  refresh: () => {
    throw new Error("No dictionary context provided");
  },
});
