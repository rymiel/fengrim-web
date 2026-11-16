import { Icon, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import {
  Dictionary,
  DictionaryList,
  Meanings,
  RowRenderer,
  ScriptCell,
  SectionTitle,
  SIMPLE_SECTIONS,
  StatusIcons,
  useTitle,
} from "conlang-web-components";
import { useContext } from "react";

const rowRender: RowRenderer = (e) => ({
  eng: <span>
    <StatusIcons entry={e} />
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
  ...(e.script !== undefined && { trans: <ScriptCell entry={e} /> }),
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
