import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { Change, SoundChangePage as Content, useTitle } from "conlang-web-components";
import { useContext } from "react";

import { Dictionary } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";

export default function SoundChangePage() {
  const { entries } = useContext(Dictionary);
  const config = useContext(LangConfig);
  useTitle("Sound changes");

  let content;

  if (entries === null || config === null) {
    content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  } else {
    const makeLocal = (changes: readonly Change[]) => config.soundChange.copyWithChanges(changes);
    content = <div className="inter">
      <Content entries={entries} soundChange={config.soundChange} makeLocal={makeLocal} />
    </div>;
  }

  return content;
}
