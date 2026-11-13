import { ReactElement, ReactNode } from "react";

import { FullEntry } from "providers/dictionary";

export type GeneratedField = readonly [name: string, value: ReactNode];

export type EditField = readonly [key: "ex", placeholder: string];

export interface ReverseResult {
  readonly items: readonly ReactNode[];
  readonly entries: readonly FullEntry[];
}

export interface ReverseLookup {
  readonly formsCount: string;
  readonly controls?: ReactElement;
  readonly lookup: ((query: string) => ReverseResult) | null;
}
