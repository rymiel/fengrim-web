import { BlueprintProvider } from "@blueprintjs/core";
import { ConlangProvider, ErrorPage, SHARED_ROUTES, SiteContext } from "conlang-web-components";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
    children: [...SHARED_ROUTES, ...SITE.routes],
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
