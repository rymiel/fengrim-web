import { Button, ControlGroup, Divider, InputGroup, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { uri, useTitle } from "conlang-web-components";
import { Fragment, memo, ReactNode, useContext, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Part } from "lang/extra";
import { Dictionary, FullEntry } from "providers/dictionary";

interface Affix {
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

function useAffixes(entries: FullEntry[]): Affix[] {
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

const lookupEmpty = (lookup: Lookup): boolean => lookup.affix.length === 0 && lookup.terminal.length === 0;

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

function TerminalTreeNode({ node: { entry } }: { node: TerminalNode }) {
  let meaning = entry.meanings[0].eng;
  if (entry.meanings.length > 1) {
    meaning += "; ...";
  }
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

function LookupTree({ lookup: { terminal, affix } }: { lookup: Lookup }) {
  return <ul>
    {terminal.map((i, j) => <li key={j}>
      <TerminalTreeNode node={i} />
    </li>)}
    {affix.map((i, j) => <li key={j}>
      <AffixTreeNode node={i} />
    </li>)}
  </ul>;
}

const ReverseContent = memo(function ReverseContent({
  entries,
  affixes,
  query,
}: {
  entries: FullEntry[];
  affixes: Affix[];
  query: string;
}) {
  const lookup = useLookup(entries, affixes, query);

  if (lookupEmpty(lookup)) {
    return <ul>
      <li>
        <i>{query}</i>:{" "}
        <Tag intent="danger" size="large" icon="cross-circle">
          Invalid word
        </Tag>
      </li>
    </ul>;
  } else {
    return <LookupTree lookup={lookup} />;
  }
});

function calculateFormsCount(entries: FullEntry[] | null, affixes: Affix[] | null) {
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

export default function ReversePage() {
  const { entries } = useContext(Dictionary);
  const { query } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(query ?? "");
  const affixes = useAffixes(entries ?? []); // FIXME: looks bad but it can't be conditional
  useTitle("Reverse");

  let content: ReactNode = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  const forms = calculateFormsCount(entries, affixes);

  if (query === undefined) {
    content = <NonIdealState icon="search" />;
  } else if (entries) {
    // TODO: try to fuse words? not sure if possible to make efficient
    content = query.split(/[ -]/).map((i, j) => <Fragment key={j}>
      {j > 0 && <Divider />}
      <ReverseContent entries={entries} affixes={affixes} query={i} />
    </Fragment>);
  }

  return <div className="inter">
    <form
      onSubmit={(e) => {
        navigate(uri`/reverse/${search}`);
        e.preventDefault();
      }}
    >
      <ControlGroup fill>
        <InputGroup
          placeholder={`Reverse search (${forms})`}
          onValueChange={(s) => setSearch(s)}
          value={search}
          size="large"
          fill
        />
        <Button icon="arrow-right" intent="primary" type="submit" />
      </ControlGroup>
    </form>
    {content}
  </div>;
}
