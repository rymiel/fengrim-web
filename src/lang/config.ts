import {
  ApiConfig,
  configOrEmpty,
  DEFAULT_GENERATION,
  DEFAULT_KEY_VALUE,
  DEFAULT_SOUND_CHANGE,
  GenerationInstance,
  SoundChangeInstance,
} from "conlang-web-components";

import { LangConfigData } from "providers/langConfig";

import { SyllableConfig, SyllableInstance, syllablesToIPA } from "./word";

const DEFAULT_SYLLABLE: SyllableConfig = { consonant: [], initial: [], vowel: [], final: [], tones: [] };

export function transformConfig(config: ApiConfig): LangConfigData {
  const generation = new GenerationInstance(configOrEmpty(config.generation, DEFAULT_GENERATION));
  const syllable = new SyllableInstance(configOrEmpty(config.syllable, DEFAULT_SYLLABLE));
  const soundChange = new SoundChangeInstance(
    configOrEmpty(config.sound_change, DEFAULT_SOUND_CHANGE),
    (word: string) => syllablesToIPA(syllable.syllabify(word)),
    (word: string) => word,
  );
  const abbreviations = configOrEmpty(config.abbr, DEFAULT_KEY_VALUE);
  const parts = configOrEmpty(config.parts, DEFAULT_KEY_VALUE);
  const ipa = (sentence: string) => soundChange.soundChangeSentence(sentence);
  const script = () => "no script :("; //TODO

  return { soundChange, generation, syllable, abbreviations, parts, ipa, script, config };
}
