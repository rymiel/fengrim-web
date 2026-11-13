import { Button, ControlGroup, HTMLSelect, InputGroup, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { ApiMeaning, ApiWord, uri, useTitle } from "conlang-web-components";
import { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { partName } from "common/display";
import { draftClass, useNewWordExtra } from "lang/entry";
import { Dictionary } from "providers/dictionary";
import { LangConfig, LangConfigData } from "providers/langConfig";
import { API, LANGUAGE } from "api";

function Editor({ lang }: { lang: LangConfigData }) {
  const dict = useContext(Dictionary);
  const [query, _] = useSearchParams();
  const navigate = useNavigate();
  const [sol, setSol] = useState(query.get("sol") ?? "");
  const [extra, setExtra] = useState(query.get("extra") ?? "");
  const [eng, setEng] = useState(query.get("eng") ?? "");
  const [gloss, setGloss] = useState(query.get("gloss") ?? "");
  const { fields, content, data: extraData } = useNewWordExtra(sol, extra);

  const submit = async () => {
    const data = { sol, extra, gloss: gloss === "" ? undefined : gloss, ...extraData };
    const w = await API.lang<ApiWord>("/word", "POST", {}, data);
    for (const meaning of eng.split(";")) {
      await API.lang<ApiMeaning>("/meaning", "POST", { to: w.hash }, { eng: meaning.trim() });
    }
    dict.refresh();
    navigate(uri`/edit/${w.hash}`);
  };

  return <div className="inter">
    <p>Creating new entry.</p>
    <ControlGroup vertical className="fit-width">
      <InputGroup onValueChange={setSol} placeholder={LANGUAGE} defaultValue={sol} />
      <HTMLSelect
        onChange={(e) => {
          setExtra(e.currentTarget.value);
        }}
        defaultValue={extra}
        fill
      >
        <option value="">Extra</option>
        {Object.keys(lang.parts).map((k) => <option key={k} value={k}>
          {partName(lang.parts, k, draftClass(sol, k))}
        </option>)}
      </HTMLSelect>
      <InputGroup onValueChange={setEng} placeholder="Translation" defaultValue={eng} />
      <InputGroup onValueChange={setGloss} placeholder="Gloss" defaultValue={gloss} />
      {fields}
      <span>{lang.ipa(sol)}</span>
      <Button fill intent="success" text="Submit" onClick={submit} />
    </ControlGroup>
    {content}
  </div>;
}

export default function NewWordPage() {
  const lang = useContext(LangConfig);
  useTitle("New");

  if (lang === null) {
    return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    return <div className="inter">
      <Editor lang={lang} />
    </div>;
  }
}
