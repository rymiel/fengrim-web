import { renderSite } from "conlang-web-components";

import { SITE } from "site";

import "@blueprintjs/core/lib/css/blueprint.css";
import "conlang-web-components/src/style.css";
import "./style/lang.css";

declare const WEB_VERSION: string;
declare const CWC_VERSION: string;

renderSite(SITE, { webVersion: WEB_VERSION, cwcVersion: CWC_VERSION });
