import {
  Classes,
  Divider,
  Drawer,
  DrawerSize,
  H1,
  H2,
  Icon,
  Intent,
  OverlayToaster,
  Position,
  Toaster,
} from "@blueprintjs/core";
import { ApiVersion, CustomApiError, Login, Logout, Title, User, UserOnly } from "conlang-web-components";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { Link, Outlet, ScrollRestoration, useNavigate } from "react-router-dom";

import { LANGUAGE } from "api";
import { MENU_LINKS, PRIVATE_MENU_LINKS } from "routes";

export const AppToaster = (() => {
  let promise: Promise<Toaster> | null = null;

  return () => {
    if (!promise) {
      promise = OverlayToaster.create({
        position: Position.TOP,
        usePortal: true,
      });
    }
    return promise;
  };
})();

declare const WEB_VERSION: string;
declare const CWC_VERSION: string;

export const toastErrorHandler = async (error: unknown): Promise<string> => {
  console.error(error);
  const toaster = await AppToaster();
  if (error instanceof CustomApiError) {
    return toaster.show({ intent: Intent.DANGER, message: `${error.status}: ${error.message}` });
  } else if (error instanceof Error) {
    return toaster.show({ intent: Intent.DANGER, message: error.message });
  } else {
    return toaster.show({ intent: Intent.DANGER, message: `unknown error ${error}` });
  }
};

export const toastSuccessHandler = async (message: string): Promise<string> => {
  console.info(message);
  const toaster = await AppToaster();
  return toaster.show({ intent: Intent.SUCCESS, message });
};

function Menu() {
  const [isOpen, setOpen] = useState(false);

  return <>
    <Icon className="menu" icon="menu" size={36} onClick={() => setOpen(true)} />
    <Drawer isOpen={isOpen} onClose={() => setOpen(false)} position="left" size={DrawerSize.SMALL}>
      <nav>
        <ul>
          {MENU_LINKS.map(([slug, name]) => <li key={slug}>
            <Link to={slug} onClick={() => setOpen(false)}>
              {name}
            </Link>
          </li>)}
        </ul>
        <UserOnly>
          <Divider />
          <ul>
            {PRIVATE_MENU_LINKS.map(([slug, name]) => <li key={slug}>
              <Link to={slug} onClick={() => setOpen(false)}>
                {name}
              </Link>
            </li>)}
          </ul>
        </UserOnly>
      </nav>
    </Drawer>
  </>;
}

export function App({ children }: PropsWithChildren) {
  const version = useContext(ApiVersion);
  const user = useContext(User);
  const navigate = useNavigate();
  const { title } = useContext(Title);
  if (!title) {
    document.title = LANGUAGE;
  } else {
    document.title = `${LANGUAGE} | ${title}`;
  }

  // Migrate old paths
  useEffect(() => {
    if (
      document.location.pathname === "/" &&
      document.location.hash.startsWith("#/") &&
      document.location.search === ""
    ) {
      const path = document.location.hash.slice(1);
      history.replaceState(null, "", path);
      navigate(path);
    }
  }, [navigate]);

  return <>
    <ScrollRestoration getKey={(location) => (location.pathname === "/" ? location.pathname : location.key)} />
    <header className={Classes.DARK}>
      <Menu />
      <H1 className="sc">
        <Link to="/">{LANGUAGE}</Link>
      </H1>
      {title && <>
        <Divider></Divider>
        <H2 className="sc">{title}</H2>
      </>}
      <div id="usertext">{user.user ? <Logout /> : <Login />}</div>
    </header>
    <main id="main">{children ?? <Outlet />}</main>
    <footer className={Classes.DARK}>
      <small>
        <p>
          <span className="sc">{LANGUAGE}</span> by rymiel, web version {WEB_VERSION}, cwc version {CWC_VERSION}
          {version && `, api version ${version}`}
        </p>
      </small>
    </footer>
  </>;
}
