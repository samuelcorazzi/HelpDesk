import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { TicketCard } from "@/components/TicketCard";
import { demoTickets } from "@/lib/mock-data";
import type { TicketStatus } from "@/lib/types";

type Filter = "ALL" | TicketStatus;

const filters: Array<{ value: Filter; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "OPEN", label: "Abertos" },
  { value: "IN_PROGRESS", label: "Em atendimento" },
  { value: "RESOLVED", label: "Resolvidos" },
];

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");

  const visibleTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return demoTickets.filter((ticket) => {
      const matchesStatus = filter === "ALL" || ticket.status === filter;
      const matchesSearch =
        !normalizedSearch ||
        ticket.subject.toLowerCase().includes(normalizedSearch) ||
        String(ticket.sequenceNumber).includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [filter, search]);

  const openCount = demoTickets.filter(
    (ticket) => ticket.status === "OPEN",
  ).length;
  const progressCount = demoTickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  ).length;
  const resolvedCount = demoTickets.filter(
    (ticket) => ticket.status === "RESOLVED",
  ).length;

  return (
    <>
      <Head>
        <title>Meus chamados | HelpDesk</title>
      </Head>
      <Header>
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">Portal do usuário</p>
            <h1>
              Olá, João! <span aria-hidden="true">👋</span>
            </h1>
            <p>Acompanhe suas solicitações e encontre tudo o que precisa.</p>
          </div>
          <Link className="primary-button" href="/tickets/new">
            <span className="button-plus">＋</span> Abrir novo chamado
          </Link>
        </section>

        <section className="overview-grid" aria-label="Resumo dos chamados">
          <article className="overview-card overview-open">
            <span className="overview-icon">!</span>
            <div>
              <small>Chamados abertos</small>
              <strong>{openCount}</strong>
              <p>Aguardando atendimento</p>
            </div>
          </article>
          <article className="overview-card overview-progress">
            <span className="overview-icon">↻</span>
            <div>
              <small>Em atendimento</small>
              <strong>{progressCount}</strong>
              <p>Sendo analisado pela equipe</p>
            </div>
          </article>
          <article className="overview-card overview-resolved">
            <span className="overview-icon">✓</span>
            <div>
              <small>Chamados resolvidos</small>
              <strong>{resolvedCount}</strong>
              <p>Finalizados com sucesso</p>
            </div>
          </article>
        </section>

        <section className="tickets-section" id="tickets">
          <div className="section-heading">
            <div>
              <h2>Meus chamados</h2>
              <p>Consulte o histórico e o andamento das suas solicitações.</p>
            </div>
            <label className="search-field">
              <span>⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por assunto ou protocolo"
                aria-label="Buscar chamados"
              />
            </label>
          </div>

          <div
            className="filter-tabs"
            role="tablist"
            aria-label="Filtrar chamados"
          >
            {filters.map((item) => {
              const count =
                item.value === "ALL"
                  ? demoTickets.length
                  : demoTickets.filter((ticket) => ticket.status === item.value)
                      .length;

              return (
                <button
                  className={filter === item.value ? "active" : ""}
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                >
                  {item.label} <span>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="ticket-list">
            {visibleTickets.length ? (
              visibleTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">⌕</span>
                <h3>Nenhum chamado encontrado</h3>
                <p>Tente alterar o filtro ou buscar por outro termo.</p>
              </div>
            )}
          </div>
          <p className="demo-note">
            Dados demonstrativos do frontend. A integração com os chamados da
            API será a próxima etapa.
          </p>
        </section>
      </Header>
    </>
  );
}
