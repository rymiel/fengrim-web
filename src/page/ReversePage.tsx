import { Button, ControlGroup, Divider, InputGroup, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { uri, useTitle } from "conlang-web-components";
import { Fragment, memo, ReactNode, useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Part } from "lang/extra";
import { Affix, AffixNode, Lookup, lookupEmpty, TerminalNode, useAffixes, useLookup } from "lang/reverse";
import { Dictionary, FullEntry } from "providers/dictionary";

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
