import {
  Button,
  CheckboxCard,
  Code,
  FormGroup,
  HTMLTable,
  NonIdealState,
  Spinner,
  SpinnerSize,
  Tag,
  TextArea,
} from "@blueprintjs/core";
import { useTitle } from "conlang-web-components";
import { ReactNode, useContext, useState } from "react";
import reactStringReplace from "react-string-replace";

import { Change, SoundChangeInstance } from "lang/soundChange";
import { SyllableInstance } from "lang/word";
import { Dictionary, FullEntry } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";
import { AppToaster } from "App";

function intersperse(arr: ReactNode[], w: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  arr.forEach((i, j) => {
    if (j > 0) {
      out.push(w);
    }
    out.push(i);
  });
  return out;
}

function tags(s: string | null): ReactNode {
  if (s === null) return null;
  if (s === "")
    return <Tag intent="danger" minimal>
      ∅
    </Tag>;
  return reactStringReplace(s, /(\{\w\})/, (m, i) => <Tag key={i} intent="primary" minimal>
    {m.slice(1, -1)}
  </Tag>);
}

function SoundChange({ change }: { change: Change }) {
  const [from, to, left, right] = change.map(tags);
  if (left === null && right === null) {
    return <>
      <Code>{from}</Code> → <Code>{to}</Code>
    </>;
  } else {
    return <>
      <Code>{from}</Code> → <Code>{to}</Code> / {left && <Code>{left}</Code>} _ {right && <Code>{right}</Code>}
    </>;
  }
}

function soundChangeToString(change: Change): string {
  let [from, to, left, right] = change;
  from = from === "" ? "∅" : from;
  to = to === "" ? "∅" : to;
  if (left === null && right === null) {
    return `${from} → ${to}`;
  } else {
    left = left === null ? "" : ` ${left}`;
    right = right === null ? "" : ` ${right}`;
    return `${from} → ${to} /${left} _${right}`;
  }
}

function soundChangeFromString(s: string): Change {
  const [action, context] = s.split("/").map((i) => i.trim()) as [string, string?];
  const [from, to] = action
    .split("→")
    .map((i) => i.trim())
    .map((i) => (i === "∅" ? "" : i));
  let left = null;
  let right = null;
  if (context !== undefined) {
    [left, right] = context
      .split("_")
      .map((i) => i.trim())
      .map((i) => (i === "" ? null : i));
  }
  return [from, to, left, right];
}

function StepList({ steps }: { steps: string[] }) {
  return steps.length > 1 ? (
    intersperse(
      steps.map((v, i) => <span key={i}>{v}</span>),
      " → ",
    )
  ) : (
    <i className="center">no changes</i>
  );
}

function Content({
  entries,
  soundChange,
  syll,
}: {
  entries: FullEntry[];
  soundChange: SoundChangeInstance;
  syll: SyllableInstance;
}) {
  const [rules, setRules] = useState(soundChange.config.changes.map(soundChangeToString).join("\n"));
  const [changes, setChanges] = useState(soundChange.config.changes);
  const [localInstance, setLocalInstance] = useState<SoundChangeInstance | null>(null);
  const [ignoreNoChanges, setIgnoreNoChanges] = useState(false);

  const onChange = (text: string) => {
    setRules(text);
    setChanges(text.trim().split("\n").map(soundChangeFromString));
  };

  const makeInstance = () => {
    setLocalInstance(new SoundChangeInstance({ ...soundChange.config, changes: changes }, syll));
  };

  const clearInstance = () => {
    setLocalInstance(null);
    setRules(soundChange.config.changes.map(soundChangeToString).join("\n"));
    setChanges(soundChange.config.changes);
  };

  const copyRules = () => {
    navigator.clipboard
      .writeText(JSON.stringify(changes))
      .then(() => AppToaster().then((toaster) => toaster.show({ intent: "success", message: "Copied to clipboard" })));
  };

  return <div className="flex-row">
    <div>
      <div className="flex-row">
        <div>
          {changes.map((c, i) => <span key={i}>
            <SoundChange change={c} />
            <br />
          </span>)}
        </div>
        <TextArea style={{ minWidth: "300px" }} onChange={(e) => onChange(e.currentTarget.value)} value={rules} />
      </div>
      <Button text="Test changes" intent="success" fill onClick={makeInstance} />
      <Button text="Forget changes" intent="danger" fill onClick={clearInstance} />
      <Button text="Copy rules" intent="primary" fill onClick={copyRules} />
    </div>
    <div className="margin-auto">
      <FormGroup>
        <CheckboxCard compact onChange={(e) => setIgnoreNoChanges(e.currentTarget.checked)}>
          Ignore <i>no changes</i>
        </CheckboxCard>
      </FormGroup>
      <HTMLTable compact striped>
        <thead>
          <tr>
            <th>Word</th>
            <th>Changes</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {localInstance === null
            ? entries.map((e) => {
                const steps = soundChange.soundChangeSteps(e.sol);
                if (ignoreNoChanges && steps.length <= 1) return undefined;
                return <tr key={e.hash}>
                  <td>{e.sol}</td>
                  <td className="space-between">
                    <StepList steps={steps} />
                  </td>
                  <td>{soundChange.soundChange(e.sol)}</td>
                </tr>;
              })
            : entries.map((e) => {
                const oldSteps = soundChange.soundChangeSteps(e.sol);
                const newSteps = localInstance.soundChangeSteps(e.sol);
                if (oldSteps.toString() === newSteps.toString()) return undefined;
                return <tr key={e.hash}>
                  <td>{e.sol}</td>
                  <td>
                    <p className="space-between">
                      <StepList steps={oldSteps} />
                    </p>
                    <p className="space-between">
                      <StepList steps={newSteps} />
                    </p>
                  </td>
                  <td>
                    <p>{soundChange.soundChange(e.sol)}</p>
                    <p>{localInstance.soundChange(e.sol)}</p>
                  </td>
                </tr>;
              })}
        </tbody>
      </HTMLTable>
    </div>
  </div>;
}

export default function SoundChangePage() {
  const { entries } = useContext(Dictionary);
  const lang = useContext(LangConfig);
  useTitle("Sound changes");

  let content;

  if (entries === null || lang === null) {
    content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    content = <div className="inter">
      <Content entries={entries} soundChange={lang.soundChange} syll={lang.syllable} />
    </div>;
  }

  return content;
}
