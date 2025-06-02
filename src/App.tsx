import {
  Button,
  Classes,
  Divider,
  Drawer,
  DrawerSize,
  H1,
  H2,
  Icon,
  InputGroup,
  Intent,
  OverlayToaster,
  Popover,
  Position,
  Toaster,
} from "@blueprintjs/core";
import { ApiVersion, CustomApiError, Title, User } from "conlang-web-components";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { Link, Outlet, ScrollRestoration, useNavigate } from "react-router-dom";

import { API, LANGUAGE } from "api";

let toasterCache: Promise<Toaster> | null = null;
export const AppToaster = (): Promise<Toaster> => {
  if (toasterCache !== null) {
    return Promise.resolve(toasterCache);
  }
  const t = OverlayToaster.createAsync({
    position: Position.TOP,
    usePortal: true,
  });
  toasterCache = t;
  return t;
};

declare const WEB_VERSION: string;

export const toastErrorHandler = async (error: unknown): Promise<string> => {
  const toaster = await AppToaster();
  if (error instanceof CustomApiError) {
    return toaster.show({ intent: Intent.DANGER, message: `${error.status}: ${error.message}` });
  } else if (error instanceof Error) {
    return toaster.show({ intent: Intent.DANGER, message: error.message });
  } else {
    return toaster.show({ intent: Intent.DANGER, message: `unknown error ${error}` });
  }
};

function Login() {
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
  const user = useContext(User);
  const login = () => {
    API.general("/login", "POST", { username, secret }).then(() => user.update());
  };

  return <Popover
    interactionKind="click"
    popoverClassName={Classes.POPOVER_CONTENT_SIZING}
    content={
      <div>
        <InputGroup onValueChange={(v) => setUsername(v)} placeholder="Username" />
        <InputGroup onValueChange={(v) => setSecret(v)} placeholder="Password" type="password" />
        <Button fill intent="success" text="Log in" onClick={login} />
      </div>
    }
    renderTarget={({ isOpen, ...targetProps }) => <a {...targetProps}>Not logged in.</a>}
  />;
}

function Logout() {
  const user = useContext(User);
  const signout = () => {
    API.general("/logout", "POST").then(() => user.update());
  };

  return <Popover
    interactionKind="click"
    popoverClassName={Classes.POPOVER_CONTENT_SIZING}
    content={<Button intent={Intent.DANGER} text="Sign out" onClick={signout} />}
    renderTarget={({ isOpen, ...targetProps }) => <a {...targetProps}>{user.user?.name}</a>}
  />;
}

const MENU_LINKS = [
  ["/", "Home"],
  ["/reverse", "Reverse"],
  ["/stats", "Stats"],
  ["/translations", "Translations"],
] as const;

const PRIVATE_MENU_LINKS = [
  ["/validate", "Validate"],
  ["/numbers", "Numbers"],
  ["/sound_changes", "Sound Changes"],
  ["/generate", "Generate"],
  ["/config", "Config"],
];

function Menu() {
  const [isOpen, setOpen] = useState(false);
  const { user } = useContext(User);

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
        {user && <Divider />}
        {user && <ul>
          {PRIVATE_MENU_LINKS.map(([slug, name]) => <li key={slug}>
            <Link to={slug} onClick={() => setOpen(false)}>
              {name}
            </Link>
          </li>)}
        </ul>}
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
          <span className="sc">{LANGUAGE}</span> by rymiel, web version {WEB_VERSION}
          {version && `, api version ${version}`}
        </p>
      </small>
    </footer>
  </>;
}
