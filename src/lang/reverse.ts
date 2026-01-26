import { FullEntry } from "providers/dictionary";
import { useMemo } from "react";
import { Part } from "./extra";

export interface Affix {
  entry: FullEntry;
  isSuffix: boolean;
  isPrefix: boolean;
  applies: Part | undefined;
  raw: string;
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
  entry: FullEntry;
}

export interface AffixNode {
  original: string;
  cut: string;
  affix: Affix;
  children: TerminalNode[];
}

export interface Lookup {
  terminal: TerminalNode[];
  affix: AffixNode[];
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