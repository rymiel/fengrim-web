import { ApiConfig, GenerationInstance, Abbreviations } from "conlang-web-components";
import { createContext } from "react";

import { SoundChangeInstance } from "lang/soundChange";
import { SyllableInstance } from "lang/word";

export interface LangConfigData {
  config: ApiConfig;
  soundChange: SoundChangeInstance;
  generation: GenerationInstance;
  syllable: SyllableInstance;
  abbreviations: Abbreviations;
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
}

export const LangConfig = createContext<LangConfigData | null>(null);
