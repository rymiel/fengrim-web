import { ApiConfig, GenerationConfig, GenerationInstance } from "conlang-web-components";

import { LangConfigData } from "providers/langConfig";

import { SoundChangeConfig, SoundChangeInstance } from "./soundChange";
import { SyllableConfig, SyllableInstance } from "./word";

export function transformConfig(config: ApiConfig): LangConfigData {
  // TODO: actual api

  const soundChange = new SoundChangeInstance(SOUND_CHANGE_CONFIG);
  const generation = new GenerationInstance(config.generation as GenerationConfig);
  const syllable = new SyllableInstance(SYLLABLE_CONFIG);
  const ipa = (sentence: string) => syllable.ipa(sentence);
  const script = () => "no script :("; //TODO

  return { soundChange, generation, syllable, ipa, script, config };
}

const SOUND_CHANGE_CONFIG: SoundChangeConfig = {
  vowel: "",
  unromanize: {
    pre: [],
    post: [],
  },
  clusters: [],
  changes: [],
};

const SYLLABLE_CONFIG: SyllableConfig = {
  unromanize: [
    ["ph", "pʰ"],
    ["th", "tʰ"],
    ["kh", "kʰ"],
    ["ngg", "ŋŋ"],
    ["ng", "ŋ"],
    ["tsh", "tsʰ"],
    ["tyh", "cʰ"],
    ["ty", "c"],
    ["ny", "ɲ"],
    ["sy", "ç"],
    ["y", "j"],
    ["r", "ɾ"],
    ["-", ""],
  ],
  consonant: ["p", "pʰ", "t", "tʰ", "k", "kʰ", "m", "n", "ŋ", "f", "s", "h", "ts", "tsʰ", "l", "j", "w", "ɾ"],
  initial: ["c", "cʰ", "ɲ", "c\u0327"],
  vowel: ["a", "e", "i", "o", "u"],
  final: ["p", "t", "k", "m", "n", "ŋ", "s"],
  tones: [
    ["\u0300", "F", "˥˩"],
    ["\u0301", "R", "˩˥"],
    ["\u0304", "H", "˥"],
    ["\u030c", "L", "˩"],
    ["", "M", "˧"],
  ],
  double: [
    ["e", "ɛ"],
    ["o", "ɔ"],
  ],
};
