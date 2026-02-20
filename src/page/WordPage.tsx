import { Button, H2, H3, H4, Icon, IconSize, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { InterlinearData, InterlinearGloss, RichText, uri, User, useTitle } from "conlang-web-components";
import { Fragment, ReactElement, useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Lookup, useAffixes, useLookup } from "lang/reverse";
import { useExamples } from "lang/translations";
import { SectionTitle, SIMPLE_SECTIONS } from "page/EditWordPage";
import { Dictionary, FullEntry, FullSection } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";

function SectionContent({ entry, section, on }: { entry: FullEntry; section: FullSection; on: string }) {
  const { user } = useContext(User);
  const simple = SIMPLE_SECTIONS.find(([title]) => section.title === title);
  if (section.title === SectionTitle.TRANSLATION) {
    const data = JSON.parse(section.content) as InterlinearData;
    const extra = user && <span className="edit">
      [ <Link to={uri`/edit/${entry.hash}/${section.hash}`}>edit</Link> ]
    </span>;
    return <InterlinearGloss data={data} asterisk link indent extra={extra} />;
  } else if (simple !== undefined) {
    const [, name, iconProps] = simple;
    return <>
      <H4>
        {name} <Icon {...iconProps} size={IconSize.LARGE} />
      </H4>
      <RichText text={section.content} on={on} />
    </>;
  } else {
    return <Tag size="large" intent="danger">
      Unknown section {section.title}.
    </Tag>;
  }
}

function WordPageHeader({ entry }: { entry: FullEntry }) {
  return <>
    <H2>{entry.disp}</H2>
    <span className="space-right">{entry.phon}</span>
    <span className="space-right">{entry.ipa}</span>
  </>;
}

function Meaning({ prefix, eng }: { prefix?: string; eng: string }) {
  return <p>
    {prefix && <i>({prefix}) </i>}
    {eng}
  </p>;
}

// TODO: move to its own page?
function useTranslationUsages(entry: FullEntry, entries: readonly FullEntry[]): ReactElement[] {
  const affixes = useAffixes(entries);
  const lookup = useLookup(entries, affixes);
  const examples = useExamples(entries);
  const flattenLookup = (lookup: Lookup) => [
    ...lookup.terminal.map((t) => t.entry),
    ...lookup.affix.map((a) => a.affix.entry),
    ...lookup.affix.flatMap((a) => a.children.map((t) => t.entry)),
  ];
  const translations = examples.flatMap((e) => e.sections.map((s, i) => [e, s, i + 1] as const));
  const relevant = translations.filter(([_, s]) => {
    const data = JSON.parse(s.content) as InterlinearData;
    // TODO: use sol_sep instead for multi-word matches?
    return data.sol.split(/[?*, -]/).some((w) => flattenLookup(lookup(w)).some((e) => e === entry));
  });
  return relevant.map(([e, s, i]) => <Link to={uri`/translations/${s.hash}`} key={s.hash}>
    {e.entry.disp} {e.nth}. {i}.
  </Link>);
}

function useEtymologyUsages(entry: FullEntry, entries: readonly FullEntry[]): ReactElement[] {
  const etymologies = entries.flatMap((e) =>
    e.sections.filter((s) => s.title === SectionTitle.ETYMOLOGY).map((s) => [e, s] as const),
  );
  const relevant = etymologies.filter(([_, s]) => s.content.includes(entry.hash));
  return relevant.map(([e, s]) => <Link to={e.link} key={s.hash}>
    {e.disp} etym.
  </Link>);
}

function LookupInfo({ entry, entries }: { entry: FullEntry; entries: readonly FullEntry[] }) {
  const translationUsages = useTranslationUsages(entry, entries);
  const etymologyUsages = useEtymologyUsages(entry, entries);
  const total = translationUsages.length + etymologyUsages.length;
  return <>
    <span>
      {total} usage{total === 1 ? "" : "s"} found:
    </span>
    {translationUsages.map((i, j) => <Fragment key={j}> {i};</Fragment>)}
    {etymologyUsages.map((i, j) => <Fragment key={j}> {i};</Fragment>)}
  </>;
}

function LookupButton({ entry }: { entry: FullEntry }) {
  const { entries } = useContext(Dictionary);
  const [run, setRun] = useState(false);
  return run === false || entries === null ? (
    <Button text="Find usages" intent="primary" onClick={() => setRun(true)} />
  ) : (
    <LookupInfo entry={entry} entries={entries} />
  );
}

function WordPageContent({ entry, highlighted = false }: { entry: FullEntry; highlighted?: boolean }) {
  const { user } = useContext(User);
  const lang = useContext(LangConfig);
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (highlighted) {
      ref.current?.scrollIntoView();
    }
  }, [highlighted]);

  const partHeader = lang?.parts?.[entry.extra] ?? entry.extra;

  return <>
    <H3 className="meaning" ref={ref}>
      {highlighted ? <mark>{partHeader}</mark> : partHeader}
      {user && <span className="edit">
        [ <Link to={uri`/edit/${entry.hash}`}>edit</Link> ]
      </span>}
    </H3>

    {entry.tag && <Tag size="large" intent="danger">
      {entry.tag}
    </Tag>}
    <ol>
      {entry.meanings.map((m) => <li key={m.hash}>
        <Meaning prefix={m.prefix} eng={m.eng} />
        {m.sections.length > 0 && <dl>
          {m.sections.map((s) => <dd key={s.hash}>
            <SectionContent entry={entry} section={s} on={entry.hash} />
          </dd>)}
        </dl>}
      </li>)}
    </ol>
    {entry.sections.map((s) => <SectionContent key={s.hash} entry={entry} section={s} on={entry.hash} />)}
    {user && <LookupButton entry={entry} />}
  </>;
}

export default function WordPage() {
  const { entries } = useContext(Dictionary);
  const lang = useContext(LangConfig);
  const { word, num } = useParams() as { word: string; num?: string };
  useTitle(word);

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    const matching = entries.filter((e) => e.sol === word);

    if (matching.length > 0) {
      const parts = matching.map((i) => lang?.parts?.[i.extra] ?? i.extra);
      content = <div className="inter word">
        <nav>
          <ol>
            {parts.map((i, j) => <li key={j}>
              <Link to={`/w/${word}/${j + 1}`}>{i}</Link>
            </li>)}
          </ol>
        </nav>
        <div className="content">
          <WordPageHeader entry={matching[0]} /> {/* TODO: Be smarter about this? */}
          {matching.map((m, i) => <WordPageContent key={m.hash} entry={m} highlighted={String(i + 1) == num} />)}
        </div>
      </div>;
    } else {
      content = <NonIdealState icon="error" title="Unknown word" description={word} />; // TODO
    }
  }

  return content;
}
