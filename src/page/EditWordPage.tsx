import {
  Button,
  Checkbox,
  Classes,
  Code,
  ControlGroup,
  Divider,
  InputGroup,
  NonIdealState,
  Popover,
  Spinner,
  SpinnerSize,
  Tag,
  TextArea,
} from "@blueprintjs/core";
import {
  ApiBase,
  ApiSection,
  BaseData,
  EditWordPageContent,
  GlossSelect,
  InfoSection,
  InfoTag,
  InterlinearData,
  InterlinearGloss,
  RichText,
  useEditContext,
  User,
  useTitle,
  WordSelect,
} from "conlang-web-components";
import { ReactElement, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Part } from "lang/extra";
import { Dictionary, FullEntry, FullMeaning, FullSection } from "providers/dictionary";
import { API, LANGUAGE } from "api";
import { AppToaster } from "App";

export enum SectionTitle {
  TRANSLATION = "translation",
  USAGE = "usage",
  ETYMOLOGY = "etymology",
  INSTEAD = "instead",
  COORDINATE = "coordinate",
}

export const SIMPLE_SECTIONS = [
  [SectionTitle.USAGE, "Usage note", { icon: "info-sign" }],
  [SectionTitle.ETYMOLOGY, "Etymology", { icon: "book" }],
  [SectionTitle.INSTEAD, "Use instead", { icon: "flow-end", intent: "danger" }],
  [SectionTitle.COORDINATE, "Coordinate terms", { icon: "compass" }],
] as const;

function EntryData({ v }: { v: FullEntry }) {
  const edit = useEditContext();
  const dict = useContext(Dictionary);

  const doDelete = () => {
    API.lang(`/entry/${v.hash}`, "DELETE").then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  return <>
    <BaseData v={v} />
    <InfoTag left="sol" right={v.sol} onClick={() => edit.openDrawer(<EntryEditor existing={v} />)} />
    <InfoTag left="extra" right={v.extra} onClick={() => edit.openDrawer(<EntryEditor existing={v} />)} />
    <InfoTag left="tag" right={v.tag} onClick={() => edit.openDrawer(<EntryEditor existing={v} />)} />
    <InfoTag left="ex" right={v.ex} onClick={() => edit.openDrawer(<EntryEditor existing={v} />)} />
    <InfoTag left="gloss" right={v.gloss} onClick={() => edit.openDrawer(<EntryEditor existing={v} />)} />
    <InfoTag left="part" right={v.part === null ? null : Part[v.part]} generated />
    <InfoTag left="ipa" right={v.ipa} generated />
    <InfoTag left="disp" right={v.disp} generated />
    <InfoSection title="meanings">
      {v.meanings.map((m, mi) => <InfoSection title={`[${mi}]`} key={m.hash}>
        <MeaningData v={m} />
      </InfoSection>)}
      <Divider />
      <Button
        intent="warning"
        text="Add new meaning"
        icon="add"
        onClick={() => edit.openDrawer(<MeaningEditor to={v.hash} />)}
      />
    </InfoSection>
    <SectionableData v={v} />
    <Button intent="danger" icon="trash" text="Delete entry" onClick={doDelete} />
  </>;
}

function MeaningData({ v }: { v: FullMeaning }) {
  const edit = useEditContext();
  return <>
    <BaseData v={v} />
    <InfoTag left="prefix" right={v.prefix} onClick={() => edit.openDrawer(<MeaningEditor existing={v} />)} />
    <InfoTag left="eng" right={v.eng} onClick={() => edit.openDrawer(<MeaningEditor existing={v} />)} />
    <SectionableData v={v} />
  </>;
}

function SectionData({ v }: { v: FullSection }) {
  const edit = useEditContext();
  const sectionDataEditorButton = useCallback((): readonly [ReactElement, () => void] => {
    const open = edit.openDrawer;
    const simple = SIMPLE_SECTIONS.find(([title]) => v.title === title);
    if (v.title === SectionTitle.TRANSLATION) {
      const data = JSON.parse(v.content) as InterlinearData;
      const handler = () => open(<TranslationSectionEditor as={v.hash} existing={data} />);
      const element = <Button intent="warning" text="Edit translation section" icon="arrow-right" onClick={handler} />;
      return [element, handler];
    } else if (simple !== undefined) {
      const [title, name] = simple;
      const handler = () => open(<TextSectionEditor as={v.hash} content={v.content} title={title} />);
      const element = <Button
        intent="warning"
        text={`Edit ${name.toLowerCase()} section`}
        icon="arrow-right"
        key={title}
        onClick={handler}
      />;
      return [element, handler];
    } else {
      const handler = () => {};
      const element = <Tag size="large" intent="danger">
        Unknown section {v.title}.
      </Tag>;
      return [element, handler];
    }
  }, [edit.openDrawer, v.content, v.hash, v.title]);
  const [button, handler] = sectionDataEditorButton();
  useEffect(() => {
    if (edit.active === v.hash && !edit.drawerOpen) {
      handler();
    }
  }, [edit.active, v.hash, handler, edit.drawerOpen]);
  return <>
    <BaseData v={v} />
    <InfoTag left="title" right={v.title} fixed />
    <InfoTag left="content" right={v.content} fixed />
    {button}
  </>;
}

interface Sectionable extends ApiBase {
  sections: ApiSection[];
}
function SectionableData({ v }: { v: Sectionable }) {
  const edit = useEditContext();
  return <>
    <InfoSection title="sections">
      {v.sections.map((s, si) => <InfoSection title={`[${si}]`} key={s.hash}>
        <SectionData v={s} />
      </InfoSection>)}
      <Divider />
      <Popover
        popoverClassName={Classes.POPOVER_CONTENT_SIZING}
        content={
          <div>
            <ControlGroup vertical>
              <Button
                intent="warning"
                text="Translation section"
                onClick={() => edit.openDrawer(<TranslationSectionEditor to={v.hash} />)}
              />
              {SIMPLE_SECTIONS.map(([title, name]) => <Button
                intent="warning"
                text={`${name} section`}
                key={title}
                onClick={() => edit.openDrawer(<TextSectionEditor to={v.hash} title={title} />)}
              />)}
            </ControlGroup>
          </div>
        }
        renderTarget={({ isOpen, ...targetProps }) => <Button
          intent="warning"
          text="Create section"
          icon="add"
          {...targetProps}
        />}
      />
    </InfoSection>
  </>;
}

type SectionEditorProps = {
  to?: string;
  as?: string;
  name: string;
  form: ReactNode;
  preview: ReactNode;
  data: () => { title: string; content: string };
};
function SectionEditor({ to, as, name, form, preview, data }: SectionEditorProps) {
  const edit = useEditContext();
  const dict = useContext(Dictionary);

  if (to === undefined && as === undefined) {
    throw new Error("One of `as` or `to` must be provided");
  }

  const doSubmit = () => {
    API.lang("/section", "POST", { to, as, ...data() }).then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  const doDelete = () => {
    if (as === undefined) {
      throw new Error("Cannot delete nonexistent section");
    }
    API.lang(`/section/${as}`, "DELETE").then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  return <div className="inter sidebar">
    {to && <p>
      Adding new {name} section to <Code>{to}</Code>.
    </p>}
    {as && <p>
      Editing {name} section <Code>{as}</Code>.
    </p>}
    {form}
    <Button fill intent="success" text="Submit" onClick={doSubmit} />
    <Divider />
    {preview}
    {as && <Button fill className="bottom" intent="danger" icon="trash" text="Delete entry" onClick={doDelete} />}
  </div>;
}

// TODO: move to conlang-web-components (and reuse its splitIntoWords and stuff)
function interlinearToObsidian(data: InterlinearData): string {
  let eng = data.eng.replaceAll("*", "");
  if (eng.at(0) === "“" && eng.at(-1) === "”") eng = eng.slice(1, -1);
  return [
    "```gloss",
    `\\ex ${data.sol.replaceAll("*", "")}`,
    `\\gla ${data.solSep}`,
    `\\glb ${data.engSep}`,
    `\\ft ${eng}`,
    "```",
  ].join("\n");
}

function italicize(s: string, bold: string, norm: string): string {
  return s
    .split(/([\u201c\u201d() -])/)
    .map((i) => (i.trim().length === 0 ? i : i.startsWith("*") ? `${bold}${i.slice(1)}${bold}` : `${norm}${i}${norm}`))
    .join("")
    .replaceAll(/(?<!\*)\* \*(?!\*)/g, " ");
}

function interlinearToReddit(data: InterlinearData): string {
  const solParts = data.solSep.split(" ");
  const engParts = data.engSep.split(" ");
  const boxes: number[] = [];
  for (let i = 0; i < Math.max(solParts.length, engParts.length); i++) {
    const s = solParts[i] ?? "";
    const e = engParts[i] ?? "";
    boxes[i] = Math.max(s.length, e.length);
  }
  return [
    italicize(data.sol, "***", "*"),
    "",
    "    " + solParts.map((s, i) => s.padEnd(boxes[i])).join(" "),
    "    " + engParts.map((s, i) => s.padEnd(boxes[i])).join(" "),
    "",
    italicize(data.eng, "**", ""),
  ].join("\n");
}

async function copyToClipboard(content: string): Promise<void> {
  await navigator.clipboard.writeText(content);
  const toaster = await AppToaster();
  toaster.show({ intent: "success", message: "Copied to clipboard" });
}

function TranslationSectionEditor({ to, as, existing }: { to?: string; as?: string; existing?: InterlinearData }) {
  const [sol, setSol] = useState(existing?.sol ?? "");
  const [solSep, setSolSep] = useState(existing?.solSep ?? "");
  const [engSep, setEngSep] = useState(existing?.engSep ?? "");
  const [eng, setEng] = useState(existing?.eng ?? "“”");
  const data: InterlinearData = {
    sol,
    solSep,
    engSep,
    eng,
  };

  const createData = () => ({
    title: SectionTitle.TRANSLATION,
    content: JSON.stringify(data),
  });
  const form = <>
    <ControlGroup fill>
      <InputGroup onValueChange={setSol} value={sol} placeholder="Sentence" fill />
      <GlossSelect {...{ setSol, setSolSep, setEngSep }} />
    </ControlGroup>
    <InputGroup onValueChange={setSolSep} value={solSep} placeholder="Interlinearised sentence" />
    <InputGroup onValueChange={setEngSep} value={engSep} placeholder="Interlinearised translation" />
    <InputGroup onValueChange={setEng} value={eng} placeholder="Translation" />
  </>;
  const copyObsidian = () => copyToClipboard(interlinearToObsidian(data));
  const copyReddit = () => copyToClipboard(interlinearToReddit(data));
  const preview = <>
    <Button fill icon="export" text="Export as Obsidian" onClick={copyObsidian} />
    <Button fill icon="export" text="Export as Reddit" onClick={copyReddit} />
    <InterlinearGloss data={data} asterisk />
  </>;

  return <SectionEditor to={to} as={as} name="translation" form={form} preview={preview} data={createData} />;
}

function TextSectionEditor({
  to,
  as,
  title,
  content: existingContent,
}: {
  to?: string;
  as?: string;
  title: SectionTitle;
  content?: string;
}) {
  const edit = useEditContext();
  const [content, setContent] = useState(existingContent ?? "");

  const createData = () => ({ title, content });
  const form = <ControlGroup fill>
    <TextArea
      onChange={(e) => setContent(e.currentTarget.value)}
      value={content}
      placeholder={`Content for ${title}`}
      fill
    />
    <WordSelect onSelect={(t) => setContent((c) => `${c}[${t.hash}] (“${t.meanings[0]?.eng}”)`)} />
  </ControlGroup>;
  const preview = <RichText text={content} on={edit.page} />;

  return <SectionEditor to={to} as={as} name={`${title} text`} form={form} preview={preview} data={createData} />;
}

function EntryEditor({ existing }: { existing: FullEntry }) {
  const edit = useEditContext();
  const dict = useContext(Dictionary);
  const [sol, setSol] = useState(existing.sol);
  const [extra, setExtra] = useState(existing.extra);
  const [isObsolete, setObsolete] = useState(existing.tag === "obsolete");
  const [gloss, setGloss] = useState(existing.gloss);
  const as = existing.hash;

  const submit = () => {
    API.lang("/entry", "POST", {
      as,
      sol,
      extra,
      tag: isObsolete ? "obsolete" : undefined,
      gloss: gloss === "" ? undefined : gloss,
    }).then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  return <div className="inter">
    <p>
      Editing entry <Code>{as}</Code>.
    </p>
    <InputGroup onValueChange={setSol} defaultValue={sol} placeholder={LANGUAGE} />
    <InputGroup onValueChange={setExtra} defaultValue={extra} placeholder="Extra" />
    <InputGroup onValueChange={setGloss} defaultValue={gloss} placeholder="Gloss" />
    <Checkbox onChange={(e) => setObsolete(e.currentTarget.checked)} defaultValue={extra} label="Obsolete" />
    <Button fill intent="success" text="Submit" onClick={submit} />
  </div>;
}

function MeaningEditor({ to, existing }: { to?: string; existing?: FullMeaning }) {
  const edit = useEditContext();
  const dict = useContext(Dictionary);
  const [rest, setRest] = useState(existing?.eng ?? "");
  const [prefix, setPrefix] = useState(existing?.prefix ?? "");
  const as = existing?.hash;

  if (to === undefined && as === undefined) {
    throw new Error("One of `as` or `to` must be provided");
  }

  const doSubmit = () => {
    const eng = prefix === undefined || prefix === "" ? rest : `(${prefix}) ${rest}`;
    API.lang("/meaning", "POST", { to, as, eng }).then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  const doDelete = () => {
    if (as === undefined) {
      throw new Error("Cannot delete nonexistent section");
    }
    API.lang(`/meaning/${as}`, "DELETE").then(() => {
      dict.refresh();
      edit.closeDrawer();
    });
  };

  return <div className="inter sidebar">
    {to && <p>
      Adding new meaning to <Code>{to}</Code>.
    </p>}
    {as && <p>
      Editing meaning <Code>{as}</Code>.
    </p>}
    <InputGroup onValueChange={setPrefix} defaultValue={prefix} placeholder="Prefix" />
    <InputGroup onValueChange={setRest} defaultValue={rest} placeholder="English" />
    <Button fill intent="success" text="Submit" onClick={doSubmit} />
    {as && <Button fill className="bottom" intent="danger" icon="trash" text="Delete entry" onClick={doDelete} />}
  </div>;
}

export default function EditWordPage() {
  const { entries } = useContext(Dictionary);
  const { hash, edit } = useParams() as { hash: string; edit?: string };
  const { user } = useContext(User);
  useTitle("Edit");

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (!user) {
    content = <NonIdealState icon="error" title="You cannot access this page" />;
  } else if (entries) {
    const entry = entries.find((e) => e.hash === hash);

    if (entry) {
      content = <div className="inter">
        <EditWordPageContent entry={entry} active={edit}>
          <EntryData v={entry} />
        </EditWordPageContent>
      </div>;
    } else {
      content = <NonIdealState icon="error" title="Unknown word" description={hash} />; // TODO
    }
  }

  return content;
}
