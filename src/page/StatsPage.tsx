import { Divider, H4, HTMLTable, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useTitle } from "conlang-web-components";
import { useContext } from "react";

import { Dictionary } from "providers/dictionary";

function increment(m: Record<string, number>, k: string): Record<string, number> {
  m[k] = (m[k] ?? 0) + 1;
  return m;
}

function Content() {
  const { entries } = useContext(Dictionary);

  let content = <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  if (entries) {
    const nounClassTally: Record<string, number> = {};
    const verbClassTally: Record<string, number> = {};
    const extraTally: Record<string, number> = {};

    for (const e of entries) {
      increment(extraTally, e.extra);
    }

    content = <div className="stats">
      <H4 className="n-header">Noun stats</H4>

      <HTMLTable className="n-left" compact striped>
        <thead>
          <tr>
            <th>Class</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(nounClassTally)
            .sort()
            .map((i) => <tr key={i}>
              <td>{i}</td>
              <td>{nounClassTally[i]}</td>
            </tr>)}
        </tbody>
      </HTMLTable>
      <HTMLTable className="n-right" compact striped>
        <thead>
          <tr>
            <th>Gender</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody></tbody>
      </HTMLTable>
      <Divider className="divider-1" />
      <H4 className="v-header">Verb stats</H4>
      <HTMLTable className="v-left" compact striped>
        <thead>
          <tr>
            <th>Class</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(verbClassTally)
            .sort()
            .map((i) => <tr key={i}>
              <td>{i}</td>
              <td>{verbClassTally[i]}</td>
            </tr>)}
        </tbody>
      </HTMLTable>
      <HTMLTable className="v-right" compact striped>
        <thead>
          <tr>
            <th>Base</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody></tbody>
      </HTMLTable>
      <Divider className="divider-2" />
      <H4 className="g-header">General stats</H4>
      <HTMLTable className="g-left" compact striped>
        <thead>
          <tr>
            <th>Extra</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(extraTally)
            .sort()
            .map((i) => <tr key={i}>
              <td>{i}</td>
              <td>{extraTally[i]}</td>
            </tr>)}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>{entries.length}</td>
          </tr>
        </tfoot>
      </HTMLTable>
    </div>;
  }

  return content;
}

export default function StatsPage() {
  useTitle("Stats");
  return <div className="inter">
    <Content />
  </div>;
}
