import { ApiConfig, GenerationInstance, KeyValue, SoundChangeInstance } from "conlang-web-components";
import { createContext } from "react";

import { LangConfigFields } from "lang/config";

export interface LangConfigData extends LangConfigFields {
  config: ApiConfig;
  soundChange: SoundChangeInstance;
  generation: GenerationInstance;
  abbreviations: KeyValue;
  parts: KeyValue;
  ipa: (sentence: string) => string;
  script: (sentence: string) => string;
  hasScript: boolean;
}

export const LangConfig = createContext<LangConfigData | null>(null);
