import { useContext } from "react";

import { LangConfig } from "providers/langConfig";

export interface DisplayWord {
  sol: string;
  ipa: string;
}

export function usePopulateDualInfo() {
  const lang = useContext(LangConfig);

  return (word: string) => ({
    sol: word,
    ipa: lang ? lang.soundChange.soundChange(word) : "[ ... ]",
  });
}
