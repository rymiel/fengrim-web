import { createApiClient, defineSite } from "conlang-web-components";

import { languageConfig } from "lang/config";
import { deriveFields } from "lang/dictionary";
import { generatedFields } from "lang/entry";
import { useReverseLookup } from "lang/reverse";
import { STATS_SECTIONS } from "lang/stats";

declare const WEB_VERSION: string;

export const SITE = defineSite({
  language: "Fengrim",
  tag: "x-elf",
  api: createApiClient({ language: "elf", version: WEB_VERSION }),
  languageConfig,
  deriveFields,
  menuLinks: [
    ["/", "Home"],
    ["/reverse", "Reverse"],
    ["/stats", "Stats"],
    ["/translations", "Translations"],
  ],
  privateMenuLinks: [
    ["/validate", "Validate"],
    ["/sound_changes", "Sound Changes"],
    ["/generate", "Generate"],
    ["/config", "Config"],
  ],
  statsSections: STATS_SECTIONS,
  generatedFields,
  useReverseLookup,
});
