import { RouteObject } from "react-router-dom";

import ReversePage from "page/ReversePage";

export const SITE_ROUTES: RouteObject[] = [
  {
    path: "/reverse",
    element: <ReversePage />,
  },
  {
    path: "/reverse/:query",
    element: <ReversePage />,
  },
];

export const MENU_LINKS = [
  ["/", "Home"],
  ["/reverse", "Reverse"],
  ["/stats", "Stats"],
  ["/translations", "Translations"],
] as const;

export const PRIVATE_MENU_LINKS = [
  ["/sound_changes", "Sound Changes"],
  ["/generate", "Generate"],
  ["/config", "Config"],
] as const;
