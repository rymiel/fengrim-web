import { useContext } from "react";

import { Dictionary } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";

import { Syllable, syllableToIPA } from "./word";

export interface Rhyme {
  readonly initial: string;
  readonly vowel: string;
  readonly tone: string;
  readonly final: string;
}

export function syllableToRhyme(syll: Syllable): Rhyme {
  const initial = syll.initial?.[1] ?? "∅";
  const vowel = syll.vowel[1];
  const tone = syll.tone[1];
  const final = syll.final?.[1] ?? "∅";
  return { initial, vowel, tone, final } as const;
}

export function useRhymes(): Rhyme[] | null {
  const { entries } = useContext(Dictionary);
  const config = useContext(LangConfig);

  if (!entries || !config) return null;

  const map = new Map<string, Syllable>();
  for (const entry of entries) {
    for (const syll of config.syllable.syllabifyPhraseFlat(entry.sol)) {
      map.set(syllableToIPA(syll), syll);
    }
  }

  return [...map.values()].map(syllableToRhyme);
}

export type RhymeMatch = Partial<Rhyme>;

export function rhymeMatchToString(
  match: RhymeMatch,
  { alwaysInitial = false, alwaysFinal = false }: { alwaysInitial?: boolean; alwaysFinal?: boolean } = {},
): string {
  let initial = match.initial ?? "";
  if (initial === "∅" && !alwaysInitial) initial = "";
  const vowel = match.vowel ?? "";
  const tone = match.tone ?? "";
  let final = match.final ?? "";
  if (final === "∅" && !alwaysFinal) final = "";
  const hyphen = match.initial === undefined || match.vowel === undefined ? "-" : "";
  return `${initial}${hyphen}${vowel}${tone}${final}`;
}

const KEYS = ["initial", "vowel", "tone", "final"] as const;

export function rhymeMatches(rhyme: Rhyme, match: RhymeMatch): boolean {
  for (const key of KEYS) {
    if (match[key] !== undefined && match[key] !== rhyme[key]) return false;
  }
  return true;
}

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export function invertRhymeMatch(rhyme: Rhyme, match: RhymeMatch): Readonly<RhymeMatch> {
  const out: Mutable<RhymeMatch> = rhyme;
  for (const key of KEYS) {
    if (match[key] !== undefined) delete out[key];
  }
  return out;
}
