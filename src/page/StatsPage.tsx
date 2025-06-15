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

  const extraTally: Record<string, number> = {};

  for (const e of entries) {
    increment(extraTally, e.extra);
  }

  return <div className="general-stats">
    <div>
      <H4>General stats</H4>
      <HTMLTable compact striped>
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
    </div>
  </div>;
}

function seedTally(keys: readonly string[]): Record<string, number> {
  const obj: Record<string, number> = {};
  for (const k of keys) {
    obj[k] = 0;
  }
  return obj;
}

function columns<T>(arr: T[], n: number): T[][] {
  const result: T[][] = [];
  const rows = Math.ceil(arr.length / n);
  for (let row = 0; row < rows; row++) {
    const tuple: T[] = [];
    for (let i = row; i < arr.length; i += rows) {
      tuple.push(arr[i]);
    }
    result.push(tuple);
  }
  return result;
}

function SyllableContent() {
  const { entries } = useContext(Dictionary);
  const config = useContext(LangConfig);

  if (!entries || !config) return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  const data = config.syllable.config;
  const initialTally = seedTally([...data.initial, ...data.consonant].map((i) => i[1]));
  const vowelTally = seedTally(data.vowel.map((i) => i[1]));
  const finalTally = seedTally(data.final.map((i) => i[1]));
  const toneTally = seedTally(data.tones.map((i) => i[1]));

  for (const entry of entries) {
    const sylls = config.syllable.syllabify(entry.sol);
    for (const syll of sylls) {
      increment(initialTally, syll.initial?.[1] ?? "∅");
      increment(vowelTally, syll.vowel[1]);
      increment(finalTally, syll.final?.[1] ?? "∅");
      increment(toneTally, syll.tone[1]);
    }
  }

  const tables = [
    [initialTally, "Initial", 2],
    [vowelTally, "Vowel", 1],
    [finalTally, "Final", 1],
    [toneTally, "Tone", 1],
  ] as const;

  return <div className="general-stats">
    {tables.map(([tally, name, size], i) => <Fragment key={name}>
      {i > 0 && <Divider />}
      <div>
        <H4>{name}</H4>

        <HTMLTable compact striped>
          <tbody>
            {columns(
              Object.entries(tally).sort((a, b) => b[1] - a[1]),
              size,
            ).map((chunk, i) => <tr key={i}>
              {chunk.map(([k, v]) => <Fragment key={k}>
                <td>{k}</td>
                <td>{v}</td>
              </Fragment>)}
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
