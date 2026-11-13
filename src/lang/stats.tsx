import { Dialog, DialogBody, H4, HTMLTable, NonIdealState, Spinner, SpinnerSize } from "@blueprintjs/core";
import React, { FC, useContext, useState } from "react";
import { Link } from "react-router-dom";

import { PartsContent, SyllableContent } from "common/stats";
import { SlotValues, SyllableSlot } from "common/types";
import { Dictionary, FullEntry } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";

import {
  invertRhymeMatch,
  Rhyme,
  RhymeMatch,
  rhymeMatches,
  rhymeMatchToString,
  syllableToRhyme,
  useRhymes,
} from "./rhyme";

function slotMatchName(match: Partial<SlotValues>): string {
  return rhymeMatchToString(match, { alwaysInitial: true, alwaysFinal: true });
}

function SyllableSection() {
  const config = useContext(LangConfig);

  if (!config) return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;

  const data = config.syllable.config;
  const slots: readonly SyllableSlot[] = [
    { key: "initial", name: "Initial", size: 2, values: [...data.initial, ...data.consonant].map((i) => i[1]) },
    { key: "vowel", name: "Vowel", size: 1, values: data.vowel.map((i) => i[1]) },
    { key: "final", name: "Final", size: 1, values: data.final.map((i) => i[1]) },
    { key: "tone", name: "Tone", size: 1, values: data.tones.map((i) => i[1]) },
  ];
  const syllables = (word: string) =>
    config.syllable.syllabifyPhraseFlat(word).map((syll): SlotValues => ({ ...syllableToRhyme(syll) }));

  return <SyllableContent slots={slots} syllables={syllables} matchName={slotMatchName} />;
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
        const key = rhymeMatchToString(invertRhymeMatch(rhyme, match), { alwaysInitial: true });
        map.set(key, [...(map.get(key) ?? []), entry]);
      }
    }
  }
  const keys = [...map.keys()].sort();
  const name = rhymeMatchToString(match ?? {}, { alwaysFinal: true });
  return <Dialog isOpen={match !== null} onClose={() => close()} title={<>Rhymes of {name}</>}>
    <DialogBody>
      <ol>
        {keys.map((k) => <li key={k}>
          {k}
          <ul>
            {map.get(k)?.map((e) => <li key={e.hash}>
              <Link to={e.link}>{e.disp}</Link>
            </li>)}
          </ul>
        </li>)}
      </ol>
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

export const STATS_SECTIONS: readonly FC[] = [SyllableSection, PartsContent, RhymeContent, NoToneRhymeContent];
