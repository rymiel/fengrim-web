import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { InterlinearData, InterlinearGloss, uri, User, useTitle } from "conlang-web-components";
import { useContext } from "react";
import { Link } from "react-router-dom";

import { Dictionary, FullEntry, FullSection } from "providers/dictionary";

import { SectionTitle } from "./EditWordPage";

export interface Example {
  readonly entry: FullEntry;
  readonly nth: number;
  readonly sections: readonly FullSection[];
}

export function useExamples(entries: FullEntry[]): Example[] {
  return entries.flatMap((e) =>
    e.meanings
      .map((m, mi) => {
        const s = m.sections.filter((s) => s.title === SectionTitle.TRANSLATION);
        if (s.length === 0) return null;
        return { entry: e, nth: mi + 1, sections: s };
      })
      .filter((i) => i !== null),
  );
}

function Content({ entries }: { entries: FullEntry[] }) {
  const { user } = useContext(User);
  const examples = useExamples(entries);

  return <>
    <p>This page lists all translations from all words with examples sentences in the dictionary.</p>
    <ul>
      {examples.map(({ entry, nth, sections }) => <li key={`${entry.hash}-${nth}`}>
        <p>
          <Link to={entry.link}>{entry.disp}</Link> ({nth})
        </p>
        <dl>
          {sections.map((section) => <dd key={section.hash} id={section.hash}>
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
          </dd>)}
        </dl>
      </li>)}
    </ul>
  </>;
}

export default function TranslationsPage() {
  const { entries } = useContext(Dictionary);
  useTitle("Translations");

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    content = <div className="inter">
      <Content entries={entries} />
    </div>;
  }

  return content;
}
