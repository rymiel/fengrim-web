import { BlueprintProvider } from "@blueprintjs/core";
import { ConlangProvider, ErrorPage, SiteContext, UserOnly } from "conlang-web-components";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
import ValidationPage from "page/ValidationPage";
import WordPage from "page/WordPage";
import { App, toastErrorHandler, toastSuccessHandler } from "App";
import { SITE } from "site";

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
        path: "/validate",
        element: <UserOnly error>
          <ValidationPage />
        </UserOnly>,
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
      ...SITE.routes,
    ],
  },
]);

function Wrapper() {
  return <StrictMode>
    <BlueprintProvider>
      <SiteContext.Provider value={SITE}>
        <ConlangProvider
          transformDictionary={SITE.transformDictionary}
          transformConfig={SITE.transformConfig}
          api={SITE.api}
          error={toastErrorHandler}
          success={toastSuccessHandler}
          tag={SITE.tag}
          language={SITE.language}
        >
          <RouterProvider router={router} />
        </ConlangProvider>
      </SiteContext.Provider>
    </BlueprintProvider>
  </StrictMode>;
}

if (document.location.hostname === "localhost") {
  document.getElementById("root")!.classList.add("localhost");
}

createRoot(document.getElementById("root")!).render(<Wrapper />);
