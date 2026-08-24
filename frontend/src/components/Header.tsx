import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import type { User } from "@/lib/types";

type AreaAplicacao = "user" | "admin";

interface HeaderProps {
  children: ReactNode;
  area?: AreaAplicacao | "auto";
}

const emptySubscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function getAccess(area: AreaAplicacao, isClient: boolean) {
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

function getStoredUser(isClient: boolean) {
  if (!isClient) return null;

  try {
    const storedUser = localStorage.getItem("helpdesk_user");
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  } catch {
    return null;
  }
}

export function Header({ children, area = "user" }: HeaderProps) {
  const router = useRouter();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const user = getStoredUser(isClient);
  const areaResolvida: AreaAplicacao =
    area === "auto" ? (user?.role === "ADMIN" ? "admin" : "user") : area;
  const access = getAccess(areaResolvida, isClient);

  useEffect(() => {
    if (access === "login") {
      localStorage.removeItem("helpdesk_token");
      localStorage.removeItem("helpdesk_user");
      void router.replace("/login");
    }

    if (access === "home") void router.replace("/home");
  }, [access, router]);

  function logout() {
    localStorage.removeItem("helpdesk_token");
    localStorage.removeItem("helpdesk_user");
    void router.push("/login");
  }

  if (access !== "allowed") {
    return (
      <main className="auth-page">
        <div className="loading-mark">H</div>
        <p className="muted">Verificando acesso...</p>
      </main>
    );
  }

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link
          className="brand"
          href={areaResolvida === "admin" ? "/admin" : "/home"}
        >
          <span className="brand-mark">H</span>
          <span>
            Help<span className="brand-accent">Desk</span>
          </span>
        </Link>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <p className="nav-section-label">Menu principal</p>
          {areaResolvida === "admin" ? (
            <>
              <Link
                className={isActive("/admin") ? "active" : ""}
                href="/admin"
              >
                <span className="nav-icon">⌂</span> Dashboard
              </Link>
              <Link
                className={isActive("/admin/users") ? "active" : ""}
                href="/admin/users"
              >
                <span className="nav-icon">♙</span> Usuários
              </Link>
            </>
          ) : (
            <>
              <Link className={isActive("/home") ? "active" : ""} href="/home">
                <span className="nav-icon">⌂</span> Visão geral
              </Link>
              <Link
                className={
                  router.pathname.startsWith("/tickets/") &&
                  !isActive("/tickets/new")
                    ? "active"
                    : ""
                }
                href="/home#tickets"
              >
                <span className="nav-icon">▤</span> Meus chamados
              </Link>
              <Link
                className={isActive("/tickets/new") ? "active" : ""}
                href="/tickets/new"
              >
                <span className="nav-icon">＋</span> Abrir chamado
              </Link>
            </>
          )}
        </nav>

        {areaResolvida === "user" ? (
          <div className="support-card">
            <span className="support-icon">?</span>
            <strong>Precisa de ajuda?</strong>
            <p>Abra um chamado e nossa equipe entrará em contato.</p>
            <Link href="/tickets/new">Solicitar suporte</Link>
          </div>
        ) : null}

        <ConnectionStatus />
        <ThemeToggle className="sidebar-theme-toggle" showLabel />

        <div className="sidebar-user">
          <span className="user-avatar">{user?.name?.charAt(0) ?? "U"}</span>
          <span className="user-summary">
            <strong>{user?.name ?? "Usuário"}</strong>
            <small>{user?.email ?? ""}</small>
          </span>
          <button
            className="logout-button"
            type="button"
            onClick={logout}
            title="Sair"
          >
            ↪
          </button>
        </div>
      </aside>

      <div className="app-content">
        <header className="mobile-topbar">
          <Link
            className="brand"
            href={areaResolvida === "admin" ? "/admin" : "/home"}
          >
            <span className="brand-mark">H</span> HelpDesk
          </Link>
          <div className="mobile-topbar-actions">
            <ConnectionStatus compacto />
            <ThemeToggle />
            <button className="logout-button" type="button" onClick={logout}>
              Sair
            </button>
          </div>
        </header>
        <main className="page-container">{children}</main>
      </div>
    </div>
  );
}
