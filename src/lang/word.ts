import { gsub } from "conlang-web-components";

export interface SyllableConfig {
  readonly unromanize: readonly (readonly [from: string, to: string])[];
  readonly consonant: readonly string[];
  readonly initial: readonly string[];
  readonly vowel: readonly string[];
  readonly final: readonly string[];
  readonly tones: readonly (readonly [diacritic: string, letter: string, ipa: string])[];
  readonly double: readonly (readonly [from: string, to: string])[];
}

export interface Syllable {
  initial: string | undefined;
  vowel: string;
  final: string | undefined;
  tone: string;
  toneipa: string;
}

export function syllableToIPA(syll: Syllable) {
  return `${syll.initial ?? ""}${syll.vowel}${syll.final ?? ""}${syll.toneipa}`;
}

function regexGroup(s: readonly string[]): string {
  return `(${s.join("|")})`;
}

export class SyllableInstance {
  readonly #config: SyllableConfig;
  readonly #regex: RegExp;

  constructor(config: SyllableConfig) {
    this.#config = config;

    const consg = regexGroup(this.#config.consonant);
    const initg = regexGroup([...this.#config.initial, ...this.#config.consonant]);
    const vg = regexGroup(this.#config.vowel);
    const toneg = regexGroup(this.#config.tones.flatMap((i) => [i[0], i[1]]));
    const tonelg = regexGroup(this.#config.tones.map((i) => i[1]));
    const fing = regexGroup(this.#config.final);

    this.#regex = new RegExp(`${initg}?${vg}${toneg}${vg}?${tonelg}?${fing}?(?=$|${consg})`, "g");
  }

  public unromanize(word: string) {
    return gsub(word, this.#config.unromanize).normalize("NFD");
  }

  public syllabify(word: string): Syllable[] {
    return [...this.unromanize(word).matchAll(this.#regex)].map((m) => {
      const [, initial, v, tonem, vd, tonel, final] = m;
      const [, tone, toneipa] = this.#config.tones.find((letters) => letters.includes(tonem || tonel || ""))!;
      const vowel = this.#config.double.find(([k]) => k === vd)?.[1] ?? v;
      return { initial: initial?.normalize("NFC"), vowel, final, tone, toneipa };
    });
  }

  public ipa(sentence: string): string {
    const convertWord = (word: string) => this.syllabify(word).map(syllableToIPA).join(".");
    return (
      "/" +
      sentence
        .replaceAll(",", " | ") // minor prosodic break
        .replaceAll(/\s+/g, " ") // squeeze
        .split(/[_ ]/)
        .map(convertWord)
        .join(" ") +
      "/"
    );
  }
}
