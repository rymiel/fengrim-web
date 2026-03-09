import { NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Dictionary } from "providers/dictionary";

export default function IdPage() {
  const { entries } = useContext(Dictionary);
  const { hash } = useParams() as { hash: string };
  const navigate = useNavigate();

  if (entries) {
    const entry = entries.find((e) => e.hash === hash);
    if (entry) {
      navigate(entry.link, { replace: true });
    } else {
      navigate("/404");
    }
  }

  return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
}
