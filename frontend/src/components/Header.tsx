import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import type { User } from "@/lib/types";

interface HeaderProps {
  children: ReactNode;
  area?: "user" | "admin";
}

const emptySubscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function getAccess(area: HeaderProps["area"], isClient: boolean) {
  if (!isClient) return "loading";

  const token = localStorage.getItem("helpdesk_token");
  const storedUser = localStorage.getItem("helpdesk_user");

  if (!token || !storedUser) return "login";

  try {
    const user = JSON.parse(storedUser) as User;
    return area === "admin" && user.role !== "ADMIN" ? "home" : "allowed";
  } catch {
    return "login";
  }
}

export function Header({ children, area = "user" }: HeaderProps) {
  const router = useRouter();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const access = getAccess(area, isClient);

  useEffect(() => {
    if (access === "login") {
      localStorage.removeItem("helpdesk_token");
      localStorage.removeItem("helpdesk_user");
      void router.replace("/login");
    }

    if (access === "home") {
      void router.replace("/home");
    }
  }, [access, router]);

  function logout() {
    localStorage.removeItem("helpdesk_token");
    localStorage.removeItem("helpdesk_user");
    void router.push("/login");
  }

  if (access !== "allowed") {
    return (
      <main className="auth-page">
        <p className="muted">Verificando acesso...</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href={area === "admin" ? "/admin" : "/home"}>
          HelpDesk
        </Link>
        <nav aria-label="Navegação principal">
          {area === "admin" ? (
            <>
              <Link href="/admin">Dashboard</Link>
              <Link href="/admin/kanban">Kanban</Link>
              <Link href="/admin/users">Usuários</Link>
            </>
          ) : (
            <>
              <Link href="/home">Meus chamados</Link>
              <Link href="/tickets/new">Abrir chamado</Link>
            </>
          )}
          <button className="nav-logout" type="button" onClick={logout}>
            Sair
          </button>
        </nav>
      </header>
      <main className="page-container">{children}</main>
    </div>
  );
}
