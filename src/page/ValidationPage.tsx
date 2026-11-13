import { Button, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { uri, useErrorHandler, useTitle } from "conlang-web-components";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

import { ValidationFailure } from "common/types";
import { validate } from "common/validation";
import { useValidationCandidates } from "lang/validation";
import { LangConfig } from "providers/langConfig";

export default function ValidationPage() {
  const lang = useContext(LangConfig);
  const candidates = useValidationCandidates();
  const error = useErrorHandler();
  const [fail, setFail] = useState<readonly ValidationFailure[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  useTitle("Validate");

  let header;
  let footer;

  if (candidates && lang) {
    header = <Button
      intent="success"
      text={`Run validation (${candidates.length} entries)`}
      fill
      disabled={isLoading}
      loading={isLoading}
      onClick={() => {
        setFail(null);
        setLoading(true);
        validate(candidates, lang.soundChange, error).then((f) => {
          setFail(f);
          setLoading(false);
        });
      }}
    />;
    if (fail !== null && fail.length === 0) {
      footer = <NonIdealState icon="tick-circle" title="All words passed validation" />;
    } else if (fail !== null) {
      footer = <ul>
        {fail.map(([c, reason], i) => <li key={i}>
          <Link to={uri`/reverse/${c.sol}`}>{c.label}</Link>: {reason}
        </li>)}
      </ul>;
    }
  } else {
    footer = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  }

  return <div className="inter">
    {header}
    {footer}
  </div>;
}
