import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { ConfigPage as Content, Dictionary, LangConfig, useTitle } from "conlang-web-components";
import { useContext } from "react";

export default function ConfigPage() {
  const { refresh } = useContext(Dictionary);
  const lang = useContext(LangConfig);
  useTitle("Config");

  if (lang === null) {
    return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    return <div className="inter">
      <Content config={lang.config} refresh={refresh} />
    </div>;
  }
}
