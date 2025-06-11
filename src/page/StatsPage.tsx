import { Divider, H4, HTMLTable, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useTitle } from "conlang-web-components";
import { Fragment, useContext } from "react";

import { Dictionary } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";

function increment(m: Record<string, number>, k: string): Record<string, number> {
  m[k] = (m[k] ?? 0) + 1;
  return m;
}

function OldContent() {
  const { entries } = useContext(Dictionary);

  if (!entries) return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  const nounClassTally: Record<string, number> = {};
  const verbClassTally: Record<string, number> = {};
  const extraTally: Record<string, number> = {};

  for (const e of entries) {
    increment(extraTally, e.extra);
  }

  return <div className="stats">
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

function SyllableContent() {
  const { entries } = useContext(Dictionary);
  const config = useContext(LangConfig);

  if (!entries || !config) return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  const initialTally: Record<string, number> = {};
  const vowelTally: Record<string, number> = {};
  const finalTally: Record<string, number> = {};
  const toneTally: Record<string, number> = {};

  for (const entry of entries) {
    const sylls = config.syllable.syllabify(entry.sol);
    for (const syll of sylls) {
      increment(initialTally, syll.initial ?? "∅");
      increment(vowelTally, syll.vowel);
      increment(finalTally, syll.final ?? "∅");
      increment(toneTally, syll.tone);
    }
  }

  const tables = [
    [initialTally, "Initial"],
    [vowelTally, "Vowel"],
    [finalTally, "Final"],
    [toneTally, "Tone"],
  ] as const;

  return <div className="general-stats">
    {tables.map(([tally, name], i) => <Fragment key={name}>
      {i > 0 && <Divider />}
      <div>
        <H4>{name} stats</H4>

        <HTMLTable compact striped>
          <thead>
            <tr>
              <th>Phone</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tally)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => <tr key={k}>
                <td>{k}</td>
                <td>{v}</td>
              </tr>)}
          </tbody>
        </HTMLTable>
      </div>
    </Fragment>)}
  </div>;
}

export default function StatsPage() {
  useTitle("Stats");
  return <div className="inter">
    <SyllableContent />
    <OldContent />
  </div>;
}
