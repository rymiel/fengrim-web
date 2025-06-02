import { ApiMeaning, ApiSection, ApiWord } from "conlang-web-components";
import { createContext } from "react";

import { Part } from "lang/extra";

export interface SortableEntry extends Omit<ApiWord, "meanings" | "sections"> {
  meanings: FullMeaning[];
}
export interface FullEntry extends SortableEntry {
  part: Part | null;
  ipa: string;
  link: string;
  index: number;

  meanings: FullMeaning[];
  sections: FullSection[];
}

export interface FullMeaning extends Omit<ApiMeaning, "sections"> {
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
