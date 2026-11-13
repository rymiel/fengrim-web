import { BlueprintProvider } from "@blueprintjs/core";
import { ConlangProvider, ErrorPage, UserOnly } from "conlang-web-components";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { transformConfig } from "lang/config";
import { transformDictionary } from "lang/dictionary";
import ConfigPage from "page/ConfigPage";
import DictionaryPage from "page/DictionaryPage";
import EditWordPage from "page/EditWordPage";
import GeneratePage from "page/GeneratePage";
import IdPage from "page/IdPage";
import NewWordPage from "page/NewWordPage";
import ReversePage from "page/ReversePage";
import SoundChangePage from "page/SoundChangePage";
import StatsPage from "page/StatsPage";
import TranslationsPage from "page/TranslationsPage";
import WordPage from "page/WordPage";
import { Dictionary } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";
import { API, LANGUAGE, LANGUAGE_TAG } from "api";
import { App, toastErrorHandler, toastSuccessHandler } from "App";
import { SITE_ROUTES } from "routes";

import "@blueprintjs/core/lib/css/blueprint.css";
import "conlang-web-components/src/style.css";
import "./style/index.css";
import "./style/lang.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <App>
      <ErrorPage />
    </App>,
    children: [
      {
        path: "/",
        element: <DictionaryPage />,
      },
      {
        path: "/w/:word",
        element: <WordPage />,
      },
      {
        path: "/w/:word/:num",
        element: <WordPage />,
      },
      {
        path: "/id/:hash",
        element: <IdPage />,
      },
      {
        path: "/edit/:hash",
        element: <UserOnly error>
          <EditWordPage />
        </UserOnly>,
      },
      {
        path: "/edit/:hash/:edit",
        element: <UserOnly error>
          <EditWordPage />
        </UserOnly>,
      },
      {
        path: "/new",
        element: <UserOnly error>
          <NewWordPage />
        </UserOnly>,
      },
      {
        path: "/reverse",
        element: <ReversePage />,
      },
      {
        path: "/reverse/:query",
        element: <ReversePage />,
      },
      {
        path: "/translations",
        element: <TranslationsPage />,
      },
      {
        path: "/translations/:query",
        element: <TranslationsPage />,
      },
      {
        path: "/stats",
        element: <StatsPage />,
      },
      {
        path: "/sound_changes",
        element: <UserOnly error>
          <SoundChangePage />
        </UserOnly>,
      },
      {
        path: "/generate",
        element: <UserOnly error>
          <GeneratePage />
        </UserOnly>,
      },
      {
        path: "/config",
        element: <UserOnly error>
          <ConfigPage />
        </UserOnly>,
      },
      ...SITE_ROUTES,
    ],
  },
]);

function Wrapper() {
  return <StrictMode>
    <BlueprintProvider>
      <ConlangProvider
        dictionary={Dictionary}
        transformDictionary={transformDictionary}
        config={LangConfig}
        transformConfig={transformConfig}
        api={API}
        error={toastErrorHandler}
        success={toastSuccessHandler}
        tag={LANGUAGE_TAG}
        language={LANGUAGE}
      >
        <RouterProvider router={router} />
      </ConlangProvider>
    </BlueprintProvider>
  </StrictMode>;
}

if (document.location.hostname === "localhost") {
  document.getElementById("root")!.classList.add("localhost");
}

createRoot(document.getElementById("root")!).render(<Wrapper />);
