import { H2, H3, H4, Icon, IconSize, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { InterlinearData, InterlinearGloss, prefixSplit, RichText, uri, User, useTitle } from "conlang-web-components";
import { useContext, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";

import { PARTS_OF_SPEECH } from "lang/extra";
import { SectionTitle, SIMPLE_SECTIONS } from "page/EditWordPage";
import { Dictionary, FullEntry, FullSection } from "providers/dictionary";

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
    return <Tag large intent="danger">
      Unknown section {section.title}.
    </Tag>;
  }
}

function WordPageHeader({ entry }: { entry: FullEntry }) {
  return <>
    <H2>{entry.sol}</H2>
    <span className="space-right">{entry.ipa}</span>
  </>;
}

function Meaning({ eng }: { eng: string }) {
  const [prefix, rest] = prefixSplit(eng);

  return <p>
    {prefix && <i>({prefix}) </i>}
    {rest}
  </p>;
}

function WordPageContent({ entry, highlighted = false }: { entry: FullEntry; highlighted?: boolean }) {
  const { user } = useContext(User);
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (highlighted) {
      ref.current?.scrollIntoView();
    }
  }, [highlighted]);

  const partHeader = PARTS_OF_SPEECH[entry.extra] ?? entry.extra;

  return <>
    <H3 className="meaning" ref={ref}>
      {highlighted ? <mark>{partHeader}</mark> : partHeader}
      {user && <span className="edit">
        [ <Link to={uri`/edit/${entry.hash}`}>edit</Link> ]
      </span>}
    </H3>

    {entry.tag && <Tag large intent="danger">
      {entry.tag}
    </Tag>}
    <ol>
      {entry.meanings.map((m) => <li key={m.hash}>
        <Meaning eng={m.eng} />
        {m.sections.length > 0 && <dl>
          {m.sections.map((s) => <dd key={s.hash}>
            <SectionContent entry={entry} section={s} on={entry.hash} />
          </dd>)}
        </dl>}
      </li>)}
    </ol>
    {entry.sections.map((s) => <SectionContent key={s.hash} entry={entry} section={s} on={entry.hash} />)}
  </>;
}

export default function WordPage() {
  const { entries } = useContext(Dictionary);
  const { word, num } = useParams() as { word: string; num?: string };
  useTitle(word);

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    const matching = entries.filter((e) => e.sol === word);

    if (matching.length > 0) {
      const parts = matching.map((i) => PARTS_OF_SPEECH[i.extra] ?? i.extra);
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
