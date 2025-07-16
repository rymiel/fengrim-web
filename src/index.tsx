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
import NewWordPage from "page/NewWordPage";
import ReversePage from "page/ReversePage";
import StatsPage from "page/StatsPage";
import TranslationsPage from "page/TranslationsPage";
import WordPage from "page/WordPage";
import { Dictionary } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";
import { API } from "api";
import { App, toastErrorHandler } from "App";

import "@blueprintjs/core/lib/css/blueprint.css";
import "conlang-web-components/src/style.css";
import "./style/index.css";

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
        path: "/edit/:hash",
        element: <EditWordPage />,
      },
      {
        path: "/edit/:hash/:edit",
        element: <EditWordPage />,
      },
      {
        path: "/new",
        element: <NewWordPage />,
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
        path: "/stats",
        element: <StatsPage />,
      },
      {
        path: "/generate",
        element: <GeneratePage />,
      },
      {
        path: "/translations",
        element: <TranslationsPage />,
      },
      {
        path: "/config",
        element: <UserOnly error>
          <ConfigPage />
        </UserOnly>,
      },
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
        tag="x-elf"
      >
        <RouterProvider router={router} />
      </ConlangProvider>
    </BlueprintProvider>
  </StrictMode>;
}

createRoot(document.getElementById("root")!).render(<Wrapper />);
