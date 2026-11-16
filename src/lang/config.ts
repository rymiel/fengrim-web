import {
  ApiConfig,
  configOrEmpty,
  DEFAULT_SOUND_CHANGE,
  LanguageConfig,
  SoundChangeInstance,
} from "conlang-web-components";

import { SyllableConfig, SyllableInstance, syllablesToIPA } from "./word";

const DEFAULT_SYLLABLE: SyllableConfig = { consonant: [], initial: [], vowel: [], final: [], tones: [] };

declare module "conlang-web-components" {
  interface LangConfigFields {
    syllable: SyllableInstance;
  }
}

export function languageConfig(config: ApiConfig): LanguageConfig {
  const syllable = new SyllableInstance(configOrEmpty(config.syllable, DEFAULT_SYLLABLE));
  const soundChange = new SoundChangeInstance(
    configOrEmpty(config.sound_change, DEFAULT_SOUND_CHANGE),
    (word: string) => syllablesToIPA(syllable.syllabify(word)),
    (word: string) => word,
  );
  const script = () => "no script :("; //TODO
  const hasScript = false;
  return { soundChange, syllable, script, hasScript };
}
