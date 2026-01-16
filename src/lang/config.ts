import { ApiConfig, GenerationConfig, GenerationInstance, KeyValue } from "conlang-web-components";

import { LangConfigData } from "providers/langConfig";

import { SoundChangeConfig, SoundChangeInstance } from "./soundChange";
import { SyllableConfig, SyllableInstance } from "./word";

export function transformConfig(config: ApiConfig): LangConfigData {
  // TODO: actual api

  const generation = new GenerationInstance(config.generation as GenerationConfig);
  const syllable = new SyllableInstance(SYLLABLE_CONFIG);
  const soundChange = new SoundChangeInstance(config.sound_change as SoundChangeConfig, syllable);
  const abbreviations = config.abbr as KeyValue;
  const parts = config.parts as KeyValue;
  const ipa = (sentence: string) => soundChange.soundChangeSentence(sentence);
  const script = () => "no script :("; //TODO

  return { soundChange, generation, syllable, abbreviations, parts, ipa, script, config };
}

const SYLLABLE_CONFIG: SyllableConfig = {
  consonant: [
    ["z", "ts"],
    ["c", "tsʰ"],
    ["b", "p"],
    ["p", "pʰ"],
    ["d", "t"],
    ["t", "tʰ"],
    ["g", "k"],
    ["k", "kʰ"],
    ["m", "m"],
    ["n", "n"],
    ["ŋ", "ŋ"],
    ["f", "f"],
    ["s", "s"],
    ["x", "sʰ"],
    ["h", "h"],
    ["l", "l"],
    ["j", "j"],
    ["w", "w"],
    ["r", "ɾ"],
  ],
  initial: [
    ["dj", "c"],
    ["tj", "cʰ"],
    ["nj", "ɲ"],
    ["sj", "ç"],
  ],
  vowel: [
    ["a", "a"],
    ["e", "e"],
    ["i", "i"],
    ["o", "o"],
    ["u", "u"],
    ["ee", "ɛ"],
    ["oo", "ɔ"],
  ],
  final: [
    ["p", "p"],
    ["t", "t"],
    ["k", "k"],
    ["m", "m"],
    ["n", "n"],
    ["ŋ", "ŋ"],
    ["s", "s"],
  ],
  tones: [
    ["\u0300", "F", "˥˩"],
    ["\u0301", "R", "˩˥"],
    ["\u0304", "H", "˥"],
    ["\u030c", "L", "˩"],
    ["", "M", "˧"],
  ],
};
