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

export function rhymeMatchToString(match: RhymeMatch) {
  let initial = match.initial ?? "";
  if (initial === "∅") initial = "";
  const vowel = match.vowel ?? "";
  const tone = match.tone ?? "";
  let final = match.final ?? "";
  if (final === "∅") final = "";
  return `${initial}${vowel}${tone}${final}`;
}

export function rhymeMatches(rhyme: Rhyme, match: RhymeMatch) {
  if (match.initial !== undefined && match.initial !== rhyme.initial) return false;
  if (match.vowel !== undefined && match.vowel !== rhyme.vowel) return false;
  if (match.tone !== undefined && match.tone !== rhyme.tone) return false;
  if (match.final !== undefined && match.final !== rhyme.final) return false;
  return true;
}
