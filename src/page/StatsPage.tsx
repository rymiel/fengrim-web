import { useTitle } from "conlang-web-components";

import { STATS_SECTIONS } from "lang/stats";

export default function StatsPage() {
  useTitle("Stats");
  return <div className="inter stats-page">{STATS_SECTIONS.map((Section, i) => <Section key={i} />)}</div>;
}
