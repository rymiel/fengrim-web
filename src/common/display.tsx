import { AnchorButton, Icon, Tag } from "@blueprintjs/core";
import { KeyValue, useLanguageTag } from "conlang-web-components";
import { useContext } from "react";

import { entryStatus } from "lang/entry";
import { FullEntry } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";

export function partName(parts: KeyValue, extra: string, cls: string | null | undefined): string {
  return (parts[extra] ?? extra).replace("%", cls ?? "?");
}

export function shortPartName(parts: KeyValue, extra: string): string {
  return (parts[extra] ?? extra).replace(/ \(.*\)$/, "");
}

export function ExtraCell({ entry }: { entry: FullEntry }) {
  const lang = useContext(LangConfig);
  const name = lang?.parts[entry.extra];
  const text = entry.class ? `${entry.extra}-${entry.class}` : entry.extra;

  if (name) {
    return <abbr title={name.replace("%", entry.class ?? "")}>{text}</abbr>;
  } else {
    return <span>{text}</span>;
  }
}

export function ScriptCell({ entry }: { entry: FullEntry }) {
  const tag = useLanguageTag();
  return <span className="dual">
    <i>{entry.disp}</i>
    <span lang={tag}>{entry.script}</span>
  </span>;
}

export function StatusIcons({ entry }: { entry: FullEntry }) {
  return entryStatus(entry).map((s) => <Icon key={s.title} icon={s.icon} intent={s.intent} title={s.title} />);
}

export function StatusTags({ entry }: { entry: FullEntry }) {
  return entryStatus(entry).map((s) =>
    s.href !== undefined ? (
      <AnchorButton key={s.label} href={s.href} text={s.label} intent="primary" />
    ) : (
      <Tag key={s.label} size="large" intent={s.intent}>
        {s.label}
      </Tag>
    ),
  );
}
