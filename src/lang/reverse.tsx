import { Tag } from "@blueprintjs/core";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { ReverseLookup, ReverseResult } from "common/types";
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

export function useAffixes(entries: readonly FullEntry[]): readonly Affix[] {
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

function makeLookup(entries: readonly FullEntry[], affixes: readonly Affix[]): (query: string) => Lookup {
  const lookup = (q: string, { only }: { only?: Part } = {}): TerminalNode[] =>
    entries.filter((i) => i.sol === q && (only === undefined || i.part === only)).map((e) => ({ entry: e }));

  return (query: string) => {
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
  };
}

export function useLookup(entries: readonly FullEntry[], affixes: readonly Affix[]): (query: string) => Lookup {
  return makeLookup(entries, affixes);
}

function TerminalTreeNode({ node: { entry } }: { node: TerminalNode }) {
  const meaning = entry.meanings.map((m) => m.eng).join("; ");
  const tag = entry.tag === undefined ? undefined : <Tag intent="danger">{entry.tag}</Tag>;
  return <>
    <Link to={entry.link}>
      <i>{entry.disp}</i>
    </Link>
    : {tag} ({entry.extra}) "{meaning}"
  </>;
}

function AffixTreeNode({ node: { original, cut, affix, children } }: { node: AffixNode }) {
  const meaning = affix.entry.meanings[0].eng;
  const affixed = affix.isSuffix ? "suffixed" : affix.isPrefix ? "prefixed" : "affixed";

  return <>
    <i>{original}</i>: <Link to={affix.entry.link}>{meaning}</Link> {affixed} form of <i>{cut}</i>
    <ul>{children.map((i, j) => <TerminalTreeNode key={j} node={i} />)}</ul>
  </>;
}

function calculateFormsCount(entries: readonly FullEntry[] | null, affixes: readonly Affix[] | null) {
  if (entries === null || affixes === null) {
    return "...";
  }

  let nouns = 0;
  let verbs = 0;
  let adjs = 0;
  for (const e of entries) {
    if (e.part === Part.Noun) {
      nouns++;
    } else if (e.part === Part.Verb) {
      verbs++;
    } else if (e.part === Part.Adjective) {
      adjs++;
    }
  }

  let nounAffixes = 0;
  let verbAffixes = 0;
  let adjAffixes = 0;
  for (const a of affixes) {
    if (a.applies === Part.Noun) {
      nounAffixes++;
    } else if (a.applies === Part.Verb) {
      verbAffixes++;
    } else if (a.applies === Part.Adjective) {
      adjAffixes++;
    }
  }

  // TODO: stacking affixes?
  const estimate = entries.length + nouns * nounAffixes + verbs * verbAffixes + adjs * adjAffixes;
  return `${entries.length} lemmas, ${estimate} forms estimated`;
}

export function useReverseLookup(entries: readonly FullEntry[] | null): ReverseLookup {
  const affixes = useAffixes(entries ?? []);
  const lookup = useMemo(() => {
    if (entries === null) return null;
    const tree = makeLookup(entries, affixes);
    return (query: string): ReverseResult => {
      const { terminal, affix } = tree(query);
      const items = [
        ...terminal.map((node, i) => <TerminalTreeNode key={`t${i}`} node={node} />),
        ...affix.map((node, i) => <AffixTreeNode key={`a${i}`} node={node} />),
      ];
      const found = [
        ...terminal.map((t) => t.entry),
        ...affix.map((a) => a.affix.entry),
        ...affix.flatMap((a) => a.children.map((t) => t.entry)),
      ];
      return { items, entries: found };
    };
  }, [entries, affixes]);

  return { formsCount: calculateFormsCount(entries, affixes), lookup };
}
