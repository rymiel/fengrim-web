import {
  Button,
  ControlGroup,
  HTMLSelect,
  InputGroup,
  NonIdealState,
  Spinner,
  SpinnerSize,
  Tag,
} from "@blueprintjs/core";
import { uri, User, useTitle } from "conlang-web-components";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { partOfExtra } from "lang/extra";
import { SyllableInstance } from "lang/word";
import { Dictionary } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";
import { API, LANGUAGE } from "api";

function Editor({ syllable }: { syllable: SyllableInstance }) {
  const dict = useContext(Dictionary);
  const lang = useContext(LangConfig);
  const navigate = useNavigate();
  const [sol, setSol] = useState("");
  const [extra, setExtra] = useState("");
  const [eng, setEng] = useState("");
  const part = partOfExtra(extra);

  const valid = part !== null;

  const submit = () => {
    const ex = undefined;
    API.lang<string>("/entry", "POST", { sol, extra, eng, ex }).then((id) => {
      dict.refresh();
      navigate(uri`/edit/${id}`);
    });
  };

  return <div className="inter">
    <p>Creating new entry.</p>
    <ControlGroup vertical className="fit-width">
      <InputGroup onValueChange={setSol} placeholder={LANGUAGE} />
      <HTMLSelect
        onChange={(e) => {
          setExtra(e.currentTarget.value);
        }}
        defaultValue={""}
        fill
      >
        <option value="">Extra</option>
        {Object.entries(lang?.parts ?? {}).map(([k, v]) => {
          return <option key={k} value={k}>
            {v}
          </option>;
        })}
      </HTMLSelect>
      <InputGroup onValueChange={setEng} placeholder="Translation" />
      <span>{syllable.ipa(sol)}</span>
      <Button fill intent="success" text="Submit" onClick={submit} />
    </ControlGroup>
    {!valid && part !== null && <Tag large intent="danger">
      Invalid form
    </Tag>}
  </div>;
}

export default function NewWordPage() {
  const { user } = useContext(User);
  const lang = useContext(LangConfig);
  useTitle("New");

  if (!user) {
    return <NonIdealState icon="error" title="You cannot access this page" />;
  } else if (lang === null) {
    return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    return <div className="inter">
      <Editor syllable={lang.syllable} />
    </div>;
  }
}
