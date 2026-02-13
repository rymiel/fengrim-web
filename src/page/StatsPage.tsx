import { Dialog, DialogBody, H4, HTMLTable, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import { useTitle } from "conlang-web-components";
import React, { Fragment, useContext, useState } from "react";
import { Link } from "react-router-dom";

import { Rhyme, RhymeMatch, rhymeMatches, rhymeMatchToString, syllableToRhyme, useRhymes } from "lang/rhyme";
import { Dictionary, FullEntry } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";

function increment(m: Record<string, number>, k: string): Record<string, number> {
  m[k] = (m[k] ?? 0) + 1;
  return m;
}

function PartsContent() {
  const { entries } = useContext(Dictionary);

  if (!entries) return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  const extraTally: Record<string, number> = {};

  for (const e of entries) {
    increment(extraTally, e.extra);
  }

  return <div className="stats general">
    <div>
      <H4>Parts</H4>
      <HTMLTable compact striped>
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

  return <div className="stats general">
    {tables.map(([tally, name, size]) => <Fragment key={name}>
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

function RhymeDialog({ match, close }: { match: RhymeMatch | null; close: () => void }) {
  const entries = useContext(Dictionary).entries ?? [];
  const config = useContext(LangConfig);

  if (match === null || config === null) return null;

  const map = new Map<string, FullEntry[]>();
  for (const entry of entries) {
    for (const syll of config.syllable.syllabifyPhraseFlat(entry.sol)) {
      const rhyme = syllableToRhyme(syll);
      if (rhymeMatches(rhyme, match)) {
        map.set(rhyme.initial, [...(map.get(rhyme.initial) ?? []), entry]);
      }
    }
  }
  const keys = [...map.keys()];
  const name = rhymeMatchToString(match ?? {});
  return <Dialog isOpen={match !== null} onClose={() => close()} title={<>Rhymes of -{name}</>}>
    <DialogBody>
      <ul>
        {keys.map((k) => <li key={k}>
          {k}-
          <ul>
            {map.get(k)?.map((e) => <li key={e.hash}>
              <Link to={e.link}>{e.disp}</Link>
            </li>)}
          </ul>
        </li>)}
      </ul>
    </DialogBody>
  </Dialog>;
}

function RhymeCell({ className, value, onClick }: { className?: string; value: number; onClick: () => void }) {
  const set = value == 0 ? "unset" : "set";
  return <td className={`${className} ${set}`}>{value == 0 ? "-" : <a onClick={() => onClick()}>{value}</a>}</td>;
}

type Table = Record<string, Record<string, Record<string, number>>>;
interface RhymeBodyProps {
  vowels: string[];
  tones: string[];
  finals: string[];
  table: Table;
  popup: (match: RhymeMatch) => void;
}
type RhymeBody = React.FC<RhymeBodyProps>;
interface RhymeBaseProps {
  body: RhymeBody;
  title: string;
  init: (table: Table, rhyme: Rhyme) => void;
}
function RhymeBase({ body: Body, title, init }: RhymeBaseProps) {
  const config = useContext(LangConfig);
  const rhymes = useRhymes();
  const [match, setMatch] = useState<RhymeMatch | null>(null);

  if (!rhymes || !config) return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  const data = config.syllable.config;
  const vowels = data.vowel.map((i) => i[1]);
  const finals = [...data.final.map((i) => i[1]), "∅"];
  const tones = data.tones.map((i) => i[1]);
  const table: Record<string, Record<string, Record<string, number>>> = {};
  for (const v of vowels) {
    table[v] = table[v] ?? {};
    for (const t of tones) {
      table[v][t] = table[v][t] ?? {};
      for (const f of finals) {
        table[v][t][f] = 0;
      }
    }
  }

  for (const r of rhymes) {
    init(table, r);
  }

  return <div className="stats rhyme">
    <div>
      <H4>{title}</H4>
      <Body table={table} vowels={vowels} tones={tones} finals={finals} popup={setMatch} />
    </div>
    <RhymeDialog match={match} close={() => setMatch(null)} />
  </div>;
}

const DefaultRhymeBody: RhymeBody = ({ vowels, finals, tones, table, popup }: RhymeBodyProps) => {
  return <HTMLTable compact striped>
    <thead>
      <tr>
        <th colSpan={2} className="br"></th>
        {finals.map((f) => <th key={f}>-{f}</th>)}
      </tr>
    </thead>
    <tbody>
      {vowels.map((v) =>
        tones.map((t, ti) => {
          const bb = ti == tones.length - 1 ? "bb" : "";
          return <tr key={`${v}-${t}`}>
            {ti == 0 && <th className="bb" rowSpan={tones.length}>
              {v}
            </th>}
            <th className={`br ${bb}`}>{t}</th>
            {finals.map((f) => <RhymeCell
              className={bb}
              key={f}
              value={table[v][t][f]}
              onClick={() => popup({ vowel: v, tone: t, final: f })}
            />)}
          </tr>;
        }),
      )}
    </tbody>
  </HTMLTable>;
};

const NoToneRhymeBody: RhymeBody = ({ vowels, finals, table, popup }: RhymeBodyProps) => {
  return <HTMLTable compact striped>
    <thead>
      <tr>
        <th></th>
        {finals.map((f) => <th key={f}>-{f}</th>)}
      </tr>
    </thead>
    <tbody>
      {vowels.map((v) => <tr key={v}>
        <th>{v}</th>
        {finals.map((f) => <RhymeCell
          key={f}
          value={table[v]["M"][f]}
          onClick={() => popup({ vowel: v, final: f })}
        />)}
      </tr>)}
    </tbody>
  </HTMLTable>;
};

function RhymeContent() {
  return <RhymeBase
    title="Rhymes"
    body={DefaultRhymeBody}
    init={(table, r) => {
      table[r.vowel][r.tone][r.final] += 1;
    }}
  />;
}
function NoToneRhymeContent() {
  return <RhymeBase
    title="Rhymes without tones"
    body={NoToneRhymeBody}
    init={(table, r) => {
      table[r.vowel]["M"][r.final] += 1;
    }}
  />;
}

export default function StatsPage() {
  useTitle("Stats");
  return <div className="inter stats-page">
    <SyllableContent />
    <PartsContent />
    <RhymeContent />
    <NoToneRhymeContent />
  </div>;
}
