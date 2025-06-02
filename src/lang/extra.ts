export enum Part {
  Noun,
  Verb,
}

export function partOfExtra(extra: string): Part | null {
  if (extra.startsWith("N")) {
    return Part.Noun;
  } else if (extra.startsWith("V")) {
    return Part.Verb;
  } else {
    return null;
  }
}

export const PARTS_OF_SPEECH: Readonly<Record<string, string>> = {
  N: "Noun",
  V: "Verb",
  "adj.": "Adjective",
  affix: "Affix",
  "prepos.": "Preposition",
  "part.": "Particle",
  "interj.": "Interjection",
  phrase: "Phrase",
};
