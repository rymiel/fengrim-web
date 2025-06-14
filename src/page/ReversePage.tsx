import { Button, ControlGroup, Divider, InputGroup, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { prefixSplit, uri, useTitle } from "conlang-web-components";
import { Fragment, memo, ReactNode, useContext, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Part } from "lang/extra";
import { Dictionary, FullEntry } from "providers/dictionary";

function terminalTreeNode(entry: FullEntry) {
  let meaning = entry.meanings[0].eng;
  if (entry.meanings.length > 1) {
    meaning += "; ...";
  }
  const tag = entry.tag === undefined ? undefined : <Tag intent="danger">{entry.tag}</Tag>;
  return <>
    <Link to={entry.link}>
      <i>{entry.sol}</i>
    </Link>
    : {tag} ({entry.extra}) "{meaning}"
  </>;
}

interface Affix {
  entry: FullEntry;
  isSuffix: boolean;
  isPrefix: boolean;
  applies: Part | undefined;
  raw: string;
}

function affixTreeNode(original: string, cut: string, affix: Affix, children: React.ReactNode[]) {
  let meaning = affix.entry.meanings[0].eng;
  if (meaning.startsWith("(")) {
    meaning = prefixSplit(meaning)[1];
  }
  const affixed = affix.isSuffix ? "suffixed" : affix.isPrefix ? "prefixed" : "affixed";

  return <>
    <i>{original}</i>: <Link to={affix.entry.link}>{meaning}</Link> {affixed} form of <i>{cut}</i>
    <ul>{children.map((i, j) => <li key={j}>{i}</li>)}</ul>
  </>;
}

const ReverseContent = memo(function ReverseContent({ entries, query }: { entries: FullEntry[]; query: string }) {
  const affixes: Affix[] = useMemo(
    () =>
      entries
        .filter((i) => i.extra === "affix")
        .map((entry) => {
          const isSuffix = entry.sol.startsWith("-");
          const isPrefix = entry.sol.endsWith("-");
          const appliesToNoun = entry.meanings.some((i) => i.eng.startsWith("(noun)"));
          const appliesToVerb = entry.meanings.some((i) => i.eng.startsWith("(verb)"));
          // noun+verb affixes?
          const applies = appliesToNoun ? Part.Noun : appliesToVerb ? Part.Verb : undefined;
          const raw = isSuffix ? entry.sol.slice(1) : isPrefix ? entry.sol.slice(0, -1) : entry.sol;
          return { entry, isSuffix, isPrefix, applies, raw };
        }),
    [entries],
  );

  const lookup = (q: string, { only }: { only?: Part } = {}) =>
    entries.filter((i) => i.sol === q && (only === undefined || i.part === only)).map(terminalTreeNode);

  const r = lookup(query);

  for (const affix of affixes) {
    if (affix.isSuffix && query.endsWith(affix.raw)) {
      const cut = query.slice(0, -affix.raw.length);
      const rc = lookup(cut, { only: affix.applies });
      if (rc.length > 0) {
        r.push(affixTreeNode(query, cut, affix, rc));
      }
    }
    // TODO: prefixes
  }

  if (r.length === 0) {
    return <ul>
      <li>
        <i>{query}</i>:{" "}
        <Tag intent="danger" large icon="cross-circle">
          Invalid word
        </Tag>
      </li>
    </ul>;
  } else {
    return <ul>{r.map((i, j) => <li key={j}>{i}</li>)}</ul>;
  }
});

export default function ReversePage() {
  const { entries } = useContext(Dictionary);
  const { query } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(query ?? "");
  useTitle("Reverse");

  let content: ReactNode = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (query === undefined) {
    content = <NonIdealState icon="search" />;
  } else if (entries) {
    // TODO: try to fuse words? not sure if possible to make efficient
    content = query.split(/[ -]/).map((i, j) => <Fragment key={j}>
      {j > 0 && <Divider />}
      <ReverseContent entries={entries} query={i} />
    </Fragment>);
  }

  let forms = "...";
  if (entries) {
    let nouns = 0;
    let verbs = 0;
    for (const e of entries) {
      if (e.part === Part.Noun) {
        nouns++;
      } else if (e.part === Part.Verb) {
        verbs++;
      }
    }
    // TODO: automate somehow?
    const nounSuffixes = 1; // -foo
    const verbSuffixes = 2; // -tha, -jóm
    const estimate = entries.length + nouns * nounSuffixes + verbs * verbSuffixes;
    forms = `${entries.length} forms, ${estimate} estimated`;
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
          large
          fill
        />
        <Button icon="arrow-right" intent="primary" type="submit" />
      </ControlGroup>
    </form>
    {content}
  </div>;
}
