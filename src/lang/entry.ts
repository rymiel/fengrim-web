import { FullEntry, GeneratedField } from "conlang-web-components";

import { Part } from "./extra";

export function generatedFields(entry: FullEntry): readonly GeneratedField[] {
  return [["part", entry.part === null ? null : Part[entry.part]]];
}
