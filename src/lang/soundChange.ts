import { gsub, GSubMap } from "conlang-web-components";

export type Unromanize = readonly (readonly [string, string])[];
export type Change = readonly [from: string, to: string, leftContext: string | null, rightContext: string | null];
export interface SoundChangeConfig {
  readonly vowel: string;
  readonly clusters: readonly string[];
  readonly unromanize: {
    readonly pre: Unromanize;
    readonly post: Unromanize;
  };
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
  readonly #syllable: RegExp;
  readonly #vg: RegExp;

  constructor(config: SoundChangeConfig) {
    this.#config = config;
    const vg = `[${config.vowel}]`;
    const cg = `[^${config.vowel}]`;
    const groups: GSubMap = [
      ["{V}", vg],
      ["{C}", cg],
    ];
    this.#changes = config.changes.map((c) => changeToRegex(c, groups));
    this.#syllable = new RegExp(`(${vg}${cg}*?)(?=${cg}?${vg})`, "g");
    this.#vg = new RegExp(vg, "g");
  }

  public ipaWithoutSoundChange(word: string) {
    return gsub(gsub(word, this.#config.unromanize.pre), this.#config.unromanize.post);
  }

  private syllabify(word: string): string {
    word = word.replace(this.#syllable, (_, $1) => `${$1}.`);
    this.#config.clusters.forEach((cluster) => {
      word = word.replaceAll(`${cluster[0]}.${cluster[1]}`, `.${cluster}`);
    });

    return gsub(word, this.#config.unromanize.post);
  }

  private singleWordSoundChange(word: string): string {
    word = gsub(word, this.#config.unromanize.pre);
    word = gsub(word, this.#changes);

    return this.syllabify(word);
  }

  public singleWordSoundChangeSteps(word: string): string[] {
    const steps: string[] = [];
    word = gsub(word, this.#config.unromanize.pre);

    let last = word;
    steps.push(word);

    for (const [find, replace] of this.#changes) {
      word = word.replaceAll(find, replace);
      if (word !== last) {
        steps.push(word);
      }
      last = word;
    }

    if (word !== last) {
      steps.push(word);
    }

    return steps.map((w) => `[${this.syllabify(w)}]`);
  }

  public soundChange(word: string): string {
    const words = word.split(" ").map((i) => this.singleWordSoundChange(i));

    return `[${words.join(" ")}]`;
  }

  public soundChangeSentence(sentence: string): string {
    const words = sentence
      .replaceAll(",", " | ") // minor prosodic break
      .replaceAll(/\s+/g, " ") // squeeze
      .toLowerCase()
      .split(" ")
      .map((i) => this.singleWordSoundChange(i));

    return `[${words.join(" ")}]`;
  }

  public get config(): SoundChangeConfig {
    return this.#config;
  }
}
