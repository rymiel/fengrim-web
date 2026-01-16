import {
  Button,
  CheckboxCard,
  Code,
  ControlGroup,
  Divider,
  FormGroup,
  HTMLTable,
  InputGroup,
  NonIdealState,
  Spinner,
  SpinnerSize,
  Tag,
} from "@blueprintjs/core";
import { useTitle } from "conlang-web-components";
import { ReactNode, useContext, useState } from "react";
import reactStringReplace from "react-string-replace";

import { Change, SoundChangeInstance } from "lang/soundChange";
import { Dictionary, FullEntry } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";
import { API } from "api";
import { AppToaster, toastErrorHandler } from "App";

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
    return `${from} -> ${to}`;
  } else {
    left = left === null ? "" : ` ${left}`;
    right = right === null ? "" : ` ${right}`;
    return `${from} -> ${to} /${left} _${right}`;
  }
}

function soundChangeFromString(s: string): Change {
  const [action, context] = s.split("/").map((i) => i.trim()) as [string, string?];
  const [from, to] = action
    .split("->")
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

type MakeLocalSoundChange = (changes: readonly Change[]) => SoundChangeInstance;

// TODO: move to conlang-web-components
function Content({
  entries,
  soundChange,
  makeLocal,
}: {
  entries: FullEntry[];
  soundChange: SoundChangeInstance;
  makeLocal: MakeLocalSoundChange;
}) {
  const [changes, setChanges] = useState(soundChange.config.changes);
  const [localInstance, setLocalInstance] = useState<SoundChangeInstance | null>(null);
  const [ignoreNoChanges, setIgnoreNoChanges] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [rule, setRule] = useState("");
  const [loading, setLoading] = useState(false);
  const { refresh } = useContext(Dictionary);

  const clearInstance = () => {
    setLocalInstance(null);
    setChanges(soundChange.config.changes);
  };

  const newRule = () => {
    const idx = changes.length;
    setChanges((changes) => [...changes, ["", "", null, null]]);
    setEditing(idx);
  };

  const startEditing = (i: number) => {
    const change = changes[i];
    setEditing(i);
    setRule(soundChangeToString(change));
  };

  const finishEditing = () => {
    if (editing === null) return;
    const change = changes[editing];
    setEditing(null);
    setRule("");
    if (soundChangeToString(change) === rule) return;
    setChanges((changes) => {
      let newChanges;
      if (rule === "") {
        newChanges = changes.filter((_, i) => i !== editing);
      } else {
        newChanges = changes.map((c, i) => (i === editing ? soundChangeFromString(rule) : c));
      }
      setLocalInstance(makeLocal(newChanges));
      return newChanges;
    });
  };

  const saveConfig = () => {
    const newConfig = { ...soundChange.config, changes: changes };
    setLoading(true);
    API.lang<string>(`/config/sound_change`, "POST", JSON.stringify(newConfig))
      .then(() => {
        AppToaster().then((toaster) => toaster.show({ intent: "success", message: "Saved" }));
        setLocalInstance(null);
        refresh();
      })
      .catch((err) => {
        toastErrorHandler(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return <div className="sound-change">
    <div className="rules">
      {changes.map((c, i) => <span key={i}>
        {i == editing ? (
          <ControlGroup>
            <Button icon="tick" intent="success" onClick={finishEditing} />
            <InputGroup onValueChange={setRule} value={rule} fill />
          </ControlGroup>
        ) : (
          <>
            <Button icon="edit" onClick={() => startEditing(i)} />
            <SoundChange change={c} />
            <br />
          </>
        )}
      </span>)}
      <Divider />
      <Button text="Add rule" intent="success" fill onClick={newRule} />
      <Button text="Forget changes" intent="danger" fill onClick={clearInstance} />
      <Button text="Save config" intent="primary" fill onClick={saveConfig} loading={loading} />
    </div>
    <div className="changes">
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
    const makeLocal = (changes: readonly Change[]) =>
      new SoundChangeInstance({ ...lang.soundChange.config, changes: changes }, lang.syllable);
    content = <div className="inter">
      <Content entries={entries} soundChange={lang.soundChange} makeLocal={makeLocal} />
    </div>;
  }

  return content;
}
