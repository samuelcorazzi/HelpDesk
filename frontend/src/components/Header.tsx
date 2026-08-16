import Link from 'next/link';
import type { ReactNode } from 'react';

interface HeaderProps {
  children: ReactNode;
  area?: 'user' | 'admin';
}

export function Header({ children, area = 'user' }: HeaderProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href={area === 'admin' ? '/admin' : '/home'}>
          HelpDesk
        </Link>
        <nav aria-label="Navegação principal">
          {area === 'admin' ? (
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
        </nav>
      </header>
      <main className="page-container">{children}</main>
    </div>
  );
}
