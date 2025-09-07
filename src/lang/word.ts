type IPAMapping = readonly [roman: string, ipa: string];
type Tone = readonly [diacritic: string, letter: string, ipa: string];

const INVALID: IPAMapping = ["×", "×"];

export interface SyllableConfig {
  readonly consonant: readonly IPAMapping[];
  readonly initial: readonly IPAMapping[];
  readonly vowel: readonly IPAMapping[];
  readonly final: readonly IPAMapping[];
  readonly tones: readonly Tone[];
}

export interface Syllable {
  initial: IPAMapping | undefined;
  vowel: IPAMapping;
  final: IPAMapping | undefined;
  tone: Tone;
}

function syllableToIPA(syll: Syllable) {
  return `${syll.initial?.[1] ?? ""}${syll.vowel[1]}${syll.final?.[1] ?? ""}${syll.tone[2]}`;
}

function syllablesToIPA(sylls: Syllable[]) {
  return sylls.map(syllableToIPA).join(".");
}

const ipaMappingRoman = (m: IPAMapping | string): string => (typeof m === "string" ? m : m[0]);

function regexGroup(s: readonly (IPAMapping | string)[]): string {
  return `(?:${s.map(ipaMappingRoman).join("|")})`;
}

export class SyllableInstance {
  readonly #config: SyllableConfig;
  readonly #regex: RegExp;

  constructor(config: SyllableConfig) {
    this.#config = config;

    const init = regexGroup([...this.#config.initial, ...this.#config.consonant]);
    const v = regexGroup(this.#config.vowel.filter((i) => i[0].length === 1));
    const tone = regexGroup(this.#config.tones.flatMap((i) => [i[0], i[1]]));
    const tonel = regexGroup(this.#config.tones.map((i) => i[1]));
    const cons = regexGroup(this.#config.consonant);
    const fin = regexGroup(this.#config.final);
    const cont = regexGroup(["$", ...this.#config.vowel, ...this.#config.consonant]);

    this.#regex = new RegExp(`(${init})?(${v})(${tone})(\\2)?(${tonel})?((?=${cons}${v})|${fin}|)'?(?=${cont})`, "g");
    console.log(this.#regex);
  }

  public mapIpaMapping(match: string | undefined, mapping: readonly IPAMapping[]): IPAMapping | undefined {
    if (match === "" || match === undefined) return undefined;
    return mapping.find(([r]) => r === match) ?? INVALID;
  }

  public syllabify(word: string): Syllable[] {
    const matches = [...word.normalize("NFD").matchAll(this.#regex)];
    return matches.map((m) => {
      const [, initial, v, tonem, vd, tonel, final] = m;
      const tone = this.#config.tones.find((letters) => letters.includes(tonem || tonel || ""))!;
      const vowel = v + (vd ?? "");
      return {
        initial: this.mapIpaMapping(initial, [...this.#config.initial, ...this.#config.consonant]),
        vowel: this.mapIpaMapping(vowel, this.#config.vowel)!,
        final: this.mapIpaMapping(final, this.#config.final),
        tone,
      };
    });
  }

  public ipa(sentence: string): string {
    const convertWord = (word: string) => syllablesToIPA(this.syllabify(word));
    return (
      "/" +
      sentence
        .split(/[,.?!]+/g)
        .map((phrase) =>
          phrase
            .replaceAll(/\s+/g, " ") // squeeze
            .replace(/^-|-$/, "") // affix hyphen
            .split(/[_ ]/)
            .map(convertWord)
            .join(" "),
        )
        .join(" | ") + // minor prosodic break
      "/"
    );
  }

  get config(): Readonly<SyllableConfig> {
    return this.#config;
  }
}
