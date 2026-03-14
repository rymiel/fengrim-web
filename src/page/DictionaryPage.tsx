import { Icon, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { DictionaryList, Meanings, RowRenderer, useTitle } from "conlang-web-components";
import { useContext } from "react";

import { SectionTitle, SIMPLE_SECTIONS } from "page/EditWordPage";
import { Dictionary, FullEntry } from "providers/dictionary";

const rowRender: RowRenderer<FullEntry> = (e: FullEntry) => ({
  eng: <span>
    {e.tag && <Tag intent="danger">{e.tag}</Tag>}
    <Meanings meanings={e.meanings} />
    {e.meanings.some((m) => m.sections.some((s) => s.title === SectionTitle.TRANSLATION)) && <Icon
      icon="label"
      title="has a translation"
    />}
    {/* move to conlang-web-components? */}
    {SIMPLE_SECTIONS.map(([title, name, iconProps]) =>
      e.sections.some((s) => s.title === title) ? (
        <Icon {...iconProps} key={title} title={`has ${name.toLowerCase()}`} />
      ) : undefined,
    )}
  </span>,
});

export default function DictionaryPage() {
  useTitle("Home");
  const { entries } = useContext(Dictionary);

  if (!entries) {
    return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  }

  return <div className="inter middle">
    <DictionaryList entries={entries} row={rowRender} />
  </div>;
}
