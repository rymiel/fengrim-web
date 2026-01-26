import { useMemo } from "react";

import { FullEntry } from "providers/dictionary";

import { Part } from "./extra";

export interface Affix {
  readonly entry: FullEntry;
  readonly isSuffix: boolean;
  readonly isPrefix: boolean;
  readonly applies: Part | undefined;
  readonly raw: string;
}

const AFFIX_PARTS = {
  noun: Part.Noun,
  verb: Part.Verb,
  adjective: Part.Adjective,
} as const;

export function useAffixes(entries: FullEntry[]): Affix[] {
  return useMemo(
    () =>
      entries
        .filter((i) => i.extra === "affix")
        .map((entry) => {
          const isSuffix = entry.sol.startsWith("-");
          const isPrefix = entry.sol.endsWith("-");
          // noun+verb affixes?
          const applies = Object.entries(AFFIX_PARTS).find(([prefix]) =>
            entry.meanings.some((i) => i.prefix === prefix),
          )?.[1];
          const raw = isSuffix ? entry.sol.slice(1) : isPrefix ? entry.sol.slice(0, -1) : entry.sol;
          return { entry, isSuffix, isPrefix, applies, raw };
        }),
    [entries],
  );
}

export interface TerminalNode {
  readonly entry: FullEntry;
}

export interface AffixNode {
  readonly original: string;
  readonly cut: string;
  readonly affix: Affix;
  readonly children: readonly TerminalNode[];
}

export interface Lookup {
  readonly terminal: readonly TerminalNode[];
  readonly affix: readonly AffixNode[];
}

export const lookupEmpty = (lookup: Lookup): boolean => lookup.affix.length === 0 && lookup.terminal.length === 0;

export function useLookup(entries: FullEntry[], affixes: Affix[], query: string): Lookup {
  const lookup = (q: string, { only }: { only?: Part } = {}): TerminalNode[] =>
    entries.filter((i) => i.sol === q && (only === undefined || i.part === only)).map((e) => ({ entry: e }));

  const terminalNodes = lookup(query);
  const affixNodes = [];

  for (const affix of affixes) {
    if (affix.isSuffix && query.endsWith(affix.raw)) {
      const cut = query.slice(0, -affix.raw.length);
      const children = lookup(cut, { only: affix.applies });
      if (children.length > 0) {
        affixNodes.push({ original: query, cut, affix, children });
      }
    }
    // TODO: prefixes
  }

  return { terminal: terminalNodes, affix: affixNodes };
}
