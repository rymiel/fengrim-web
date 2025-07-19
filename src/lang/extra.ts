export enum Part {
  Noun,
  Verb,
  Adjective,
}

export function partOfExtra(extra: string): Part | null {
  if (extra === "N") {
    return Part.Noun;
  } else if (extra === "V") {
    return Part.Verb;
  } else if (extra === "adj.") {
    return Part.Adjective;
  } else {
    return null;
  }
}
