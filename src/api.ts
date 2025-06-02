import { createApiClient } from "conlang-web-components";

export const LANGUAGE = "Elf lang";
declare const WEB_VERSION: string;

export const API = createApiClient({ language: "elf", version: WEB_VERSION });
