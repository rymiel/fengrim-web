import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { InterlinearData, InterlinearGloss, uri, User, useTitle } from "conlang-web-components";
import { useContext, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";

import { useExamples } from "lang/translations";
import { Dictionary, FullEntry, FullSection } from "providers/dictionary";

function Translation({
  entry,
  section,
  highlighted,
}: {
  entry: FullEntry;
  section: FullSection;
  highlighted: boolean;
}) {
  const { user } = useContext(User);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (highlighted) {
      ref.current?.scrollIntoView();
    }
  }, [highlighted]);

  return <dd id={section.hash} className={`translation ${highlighted ? "focus" : ""}`} ref={ref}>
    <InterlinearGloss
      data={JSON.parse(section.content) as InterlinearData}
      asterisk
      link
      indent
      extra={
        user && <span className="edit">
          [ <Link to={uri`/edit/${entry.hash}/${section.hash}`}>edit</Link> ]
        </span>
      }
    />
  </dd>;
}

function Content({ entries, query }: { entries: readonly FullEntry[]; query: string | undefined }) {
  const examples = useExamples(entries);

  return <>
    <p>This page lists all translations from all words with examples sentences in the dictionary.</p>
    <ul>
      {examples.map(({ entry, nth, sections }) => <li key={`${entry.hash}-${nth}`}>
        <p>
          <Link to={entry.link}>{entry.disp}</Link> ({nth})
        </p>
        <dl>
          {sections.map((section) => <Translation
            key={section.hash}
            entry={entry}
            section={section}
            highlighted={query === section.hash}
          />)}
        </dl>
      </li>)}
    </ul>
  </>;
}

export default function TranslationsPage() {
  const { entries } = useContext(Dictionary);
  const { query } = useParams();
  useTitle("Translations");

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    content = <div className="inter">
      <Content entries={entries} query={query} />
    </div>;
  }

  return content;
}
