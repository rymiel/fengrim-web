import { Button, HTMLTable, Icon, InputGroup, NonIdealState, Spinner, SpinnerSize, Tag } from "@blueprintjs/core";
import { entryHasMatch, UserOnly, useTitle } from "conlang-web-components";
import { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { SectionTitle, SIMPLE_SECTIONS } from "page/EditWordPage";
import { Dictionary, FullEntry, FullMeaning } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";
import { LANGUAGE } from "api";

function ExtraCell({ extra }: { extra: string }) {
  const lang = useContext(LangConfig);
  const abbr = lang?.parts?.[extra];

  if (abbr) {
    return <abbr title={abbr}>{extra}</abbr>;
  } else {
    return <span>{extra}</span>;
  }
}

function mergeDefinitions(meanings: FullMeaning[]) {
  let toBe = false;
  return meanings.map((m, mi) => {
    let eng = m.eng;
    if (eng.startsWith("to be ")) {
      if (toBe) {
        eng = eng.slice(6);
      } else {
        toBe = true;
      }
    }
    return (mi === 0 ? "" : "; ") + eng;
  });
}

function DictionaryRow({ entry }: { entry: FullEntry }) {
  const e = entry;
  return <tr>
    <td>
      <Link to={e.link} className="link-fill">
        <span>{e.index}</span>
      </Link>
    </td>
    <td>
      <Link to={e.link} className="link-fill">
        <span>
          {e.tag && <Tag intent="danger">{e.tag}</Tag>} {mergeDefinitions(e.meanings)}
          {e.meanings.some((m) => m.sections.some((s) => s.title === SectionTitle.TRANSLATION)) && <Icon
            icon="label"
            title="has a translation"
          />}
          {SIMPLE_SECTIONS.map(([title, name, iconProps]) =>
            e.sections.some((s) => s.title === title) ? (
              <Icon {...iconProps} key={title} title={`has ${name.toLowerCase()}`} />
            ) : undefined,
          )}
        </span>
      </Link>
    </td>
    <td>
      <Link to={e.link} className="link-fill">
        <i>{e.sol}</i>
      </Link>
    </td>
    <td>
      <Link to={e.link} className="link-fill">
        <ExtraCell extra={e.extra} />
      </Link>
    </td>
    <td className="pronunciation">
      <Link to={e.link} className="link-fill">
        <span>{e.ipa}</span>
      </Link>
    </td>
  </tr>;
}

export default function DictionaryPage() {
  useTitle("Home");
  const { entries } = useContext(Dictionary);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearchContainer = useCallback((ref: HTMLDivElement | null) => {
    if (ref === null) return;
    ref.style.top = document.querySelector("header")?.getBoundingClientRect().height + "px";
  }, []);

  const handleAddButton = useCallback((ref: HTMLDivElement | null) => {
    if (ref === null) return;
    ref.style.bottom = document.querySelector("footer")?.getBoundingClientRect().height + "px";
  }, []);

  if (!entries) {
    return <NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />;
  }

  return <div className="inter middle">
    <div className="around-dictionary" ref={handleSearchContainer}>
      <InputGroup type="search" placeholder="Search" onValueChange={setSearch} value={search} size="large" />
    </div>

    <HTMLTable className="dictionary" compact striped interactive>
      <thead>
        <tr>
          <th>#</th>
          <th>English</th>
          <th>{LANGUAGE}</th>
          <th>Extra</th>
          <th className="pronunciation">Pronunciation</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (entryHasMatch(search, e) ? <DictionaryRow key={e.hash} entry={e} /> : undefined))}
      </tbody>
    </HTMLTable>

    <UserOnly>
      <div className="around-dictionary" ref={handleAddButton}>
        <Button intent="success" text="Add new entry" icon="plus" fill onClick={() => navigate("/new")} />
      </div>
    </UserOnly>
  </div>;
}
