import { gsub, GSubMap } from "conlang-web-components";

import { sentenceConvert, SyllableInstance, syllablesToIPA } from "./word";

export type Unromanize = readonly (readonly [string, string])[];
export type Change = readonly [from: string, to: string, leftContext: string | null, rightContext: string | null];
export interface SoundChangeConfig {
  readonly vowel: string;
  readonly changes: readonly Change[];
}

function changeToRegex(change: Change, groups: GSubMap): readonly [RegExp, string] {
  const [from, to, left, right] = change;

  let k = from;
  if (left !== null) {
    k = `(?<=${left})${k}`;
  }
  if (right !== null) {
    k = `${k}(?=${right})`;
  }

  return [new RegExp(gsub(k, groups), "g"), to];
}

export class SoundChangeInstance {
  readonly #config: SoundChangeConfig;
  readonly #changes: GSubMap;
  readonly #syll: SyllableInstance;

  constructor(config: SoundChangeConfig, syll: SyllableInstance) {
    this.#config = config;
    this.#syll = syll;
    const vg = `[${config.vowel}]`;
    const cg = `[^${config.vowel}]`;
    const groups: GSubMap = [
      ["{V}", vg],
      ["{C}", cg],
      ["{T}", `[\u02E5-\u02E9]+`],
    ];
    this.#changes = config.changes.map((c) => changeToRegex(c, groups));
  }

  public ipaWithoutSoundChange(word: string) {
    return syllablesToIPA(this.#syll.syllabify(word));
  }

  private singleWordSoundChange(word: string): string {
    word = this.ipaWithoutSoundChange(word);
    word = gsub(word, this.#changes);
    return word;
  }

  public soundChangeSteps(word: string): string[] {
    const steps: string[][] = [];
    let words = word.split(" ").map((i) => this.ipaWithoutSoundChange(i));

    let last = words;
    steps.push(words);

    for (const [find, replace] of this.#changes) {
      words = words.map((i) => i.replaceAll(find, replace));
      if (words.join(" ") !== last.join(" ")) {
        steps.push(words);
      }
      last = words;
    }

    if (words.join(" ") !== last.join(" ")) {
      steps.push(words);
    }

    return steps.map((w) => `[${w.join(" ")}]`);
  }

  public soundChange(word: string): string {
    const words = word.split(" ").map((i) => this.singleWordSoundChange(i));

    return `[${words.join(" ")}]`;
  }

  public soundChangeSentence(sentence: string): string {
    const convertWord = (word: string) => this.singleWordSoundChange(word);
    return "[" + sentenceConvert(sentence, convertWord) + "]";
  }

  public get config(): SoundChangeConfig {
    return this.#config;
  }
}
