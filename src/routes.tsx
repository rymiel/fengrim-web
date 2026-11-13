import { RouteObject } from "react-router-dom";

export const SITE_ROUTES: RouteObject[] = [];

export const MENU_LINKS = [
  ["/", "Home"],
  ["/reverse", "Reverse"],
  ["/stats", "Stats"],
  ["/translations", "Translations"],
] as const;

export const PRIVATE_MENU_LINKS = [
  ["/validate", "Validate"],
  ["/sound_changes", "Sound Changes"],
  ["/generate", "Generate"],
  ["/config", "Config"],
] as const;
