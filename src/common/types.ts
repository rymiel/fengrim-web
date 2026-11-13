import { IconName, Intent } from "@blueprintjs/core";
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

export interface EntryStatus {
  readonly icon: IconName;
  readonly intent: Intent;
  readonly title: string;
  readonly label: string;
  readonly href?: string;
}

export interface NewWordExtra {
  readonly fields?: ReactNode;
  readonly content?: ReactNode;
  readonly data: { readonly ex?: string };
}

export interface ValidationCandidate {
  readonly key: string;
  readonly sol: string;
  readonly label: string;
  readonly entry?: FullEntry;
}

export type ValidationFailure = readonly [candidate: ValidationCandidate, reason: string];

export type SlotValues = Readonly<Record<string, string>>;

export interface SyllableSlot {
  readonly key: string;
  readonly name: string;
  readonly size: number;
  readonly values: readonly string[];
}
