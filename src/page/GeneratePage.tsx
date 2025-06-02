import { Button, ControlGroup, Divider, NonIdealState, NumericInput, Spinner, SpinnerSize } from "@blueprintjs/core";
import { GenerationInstance, User, useTitle } from "conlang-web-components";
import { useContext, useEffect, useState } from "react";

import { LangConfig } from "providers/langConfig";

function Content({ ipa, generation }: { ipa: (s: string) => string; generation: GenerationInstance }) {
  const [current, setCurrent] = useState("");
  const [sylls, setSylls] = useState(1);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (current === "") {
      const word = generation.generateWord(sylls);
      setCurrent(word);
      setHistory((h) => [word, ...h]);
    }
  }, [current, generation, sylls]);

  const generate = () => setCurrent("");
  const changeSylls = (s: number) => {
    setSylls(s);
    generate();
  };

  return <div>
    <ControlGroup vertical className="fit-width">
      <NumericInput onValueChange={changeSylls} value={sylls} min={1} />
      <Button intent="primary" text="Generate" onClick={generate} />
    </ControlGroup>
    <Divider />
    <p>{current !== "" ? current : "..."}</p>
    <p>{current !== "" ? ipa(current) : "..."}</p>
    <Divider />
    <ul>
      {history.map((i, j) => <li key={j} onClick={() => setCurrent(i)}>
        {i}
      </li>)}
    </ul>
  </div>;
}

export default function GeneratePage() {
  const { user } = useContext(User);
  const lang = useContext(LangConfig);
  useTitle("Generate");

  let content;

  if (!user) {
    content = <NonIdealState icon="error" title="You cannot access this page" />;
  } else if (lang === null) {
    content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    content = <div className="inter">
      <Content ipa={lang.ipa} generation={lang.generation} />
    </div>;
  }

  return content;
}
