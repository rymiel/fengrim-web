import { EditField, GeneratedField } from "common/types";
import { FullEntry } from "providers/dictionary";

import { Part } from "./extra";

export function generatedFields(entry: FullEntry): readonly GeneratedField[] {
  return [["part", entry.part === null ? null : Part[entry.part]]];
}

export const EXTRA_EDIT_FIELDS: readonly EditField[] = [];
