import { ReactNode } from "react";

export type GeneratedField = readonly [name: string, value: ReactNode];

export type EditField = readonly [key: "ex", placeholder: string];
