import { useSite, useTitle } from "conlang-web-components";

export default function StatsPage() {
  const { statsSections } = useSite();
  useTitle("Stats");
  return <div className="inter stats-page">{statsSections.map((Section, i) => <Section key={i} />)}</div>;
}
