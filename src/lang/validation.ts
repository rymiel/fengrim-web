import { useContext } from "react";

import { ValidationCandidate, ValidationFailure } from "common/types";
import { Dictionary } from "providers/dictionary";

export function useValidationCandidates(): readonly ValidationCandidate[] | null {
  const { entries } = useContext(Dictionary);
  if (entries === null) return null;
  return entries.map((e) => ({ key: e.hash, sol: e.sol, label: `"${e.sol}"`, entry: e }));
}

export function validateLocal(_candidates: readonly ValidationCandidate[]): ValidationFailure[] {
  return [];
}
