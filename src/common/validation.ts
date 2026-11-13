import { SoundChangeInstance } from "conlang-web-components";

import { ValidationCandidate, ValidationFailure } from "common/types";
import { validateLocal } from "lang/validation";
import { API } from "api";

async function validateRemote(
  candidates: readonly ValidationCandidate[],
  soundChange: SoundChangeInstance,
  error: (error: unknown) => void,
): Promise<ValidationFailure[]> {
  const fail: ValidationFailure[] = [];
  const lookup = candidates.map((c) => [c.sol, soundChange.ipaWithoutSoundChange(c.sol)] as const);
  try {
    const failIdx = await API.lang<number[]>("/validate", "POST", JSON.stringify(lookup));
    failIdx.forEach((f) => {
      const c = candidates[f];
      if (c.sol.includes("-")) {
        return; // Skip all affixes for now
      }
      fail.push([c, "invalid word"]);
    });
  } catch (e) {
    error(e);
  }
  return fail;
}

export async function validate(
  candidates: readonly ValidationCandidate[],
  soundChange: SoundChangeInstance,
  error: (error: unknown) => void,
): Promise<ValidationFailure[]> {
  return [...validateLocal(candidates), ...(await validateRemote(candidates, soundChange, error))];
}
