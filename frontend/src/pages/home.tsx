import Head from "next/head";
// Painel do usuário: carrega, filtra e apresenta seus chamados.
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { TicketCard } from "@/components/TicketCard";
import { apiRequest } from "@/lib/api";
import { formatProtocol } from "@/lib/ticket-utils";
import type { Ticket, TicketStatus } from "@/lib/types";

const filtros: { rotulo: string; status: TicketStatus | "ALL" }[] = [
  { rotulo: "Todos", status: "ALL" },
  { rotulo: "Abertos", status: "OPEN" },
  { rotulo: "Em atendimento", status: "IN_PROGRESS" },
  { rotulo: "Resolvidos", status: "RESOLVED" },
];

export default function HomePage() {
  const roteador = useRouter();
  const [chamados, definirChamados] = useState<Ticket[]>([]);
  const [filtroAtivo, definirFiltroAtivo] = useState<TicketStatus | "ALL">(
    "ALL",
  );
  const [busca, definirBusca] = useState("");
  const [erro, definirErro] = useState("");
  const [carregando, definirCarregando] = useState(true);

  useEffect(() => {
    async function carregarChamados() {
      try {
        definirChamados(await apiRequest<Ticket[]>("/chamados"));
      } catch (erroCarregamento) {
        definirErro(
          erroCarregamento instanceof Error
            ? erroCarregamento.message
            : "Não foi possível carregar os chamados.",
        );
      } finally {
        definirCarregando(false);
      }
    }

    void carregarChamados();
  }, []);

  const chamadosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return chamados.filter((chamado) => {
      const correspondeStatus =
        filtroAtivo === "ALL" || chamado.status === filtroAtivo;
      const correspondeBusca =
        !termo ||
        chamado.subject.toLowerCase().includes(termo) ||
        formatProtocol(chamado.sequenceNumber).toLowerCase().includes(termo);

      return correspondeStatus && correspondeBusca;
    });
  }, [busca, chamados, filtroAtivo]);

  const quantidadePorStatus = (status: TicketStatus | "ALL") =>
    status === "ALL"
      ? chamados.length
      : chamados.filter((chamado) => chamado.status === status).length;

  return (
    <>
      <Head>
        <title>Meus chamados | HelpDesk</title>
      </Head>
      <Header>
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">Portal do usuário</p>
            <h1>Olá!</h1>
            <p>Acompanhe suas solicitações e encontre tudo o que precisa.</p>
          </div>
          <Link className="primary-button" href="/tickets/new">
            <span className="button-plus">＋</span> Abrir novo chamado
          </Link>
        </section>

        {roteador.query.chamadoCriado ? (
          <p className="form-message form-message-success">
            Chamado enviado com sucesso. Protocolo{" "}
            {formatProtocol(Number(roteador.query.chamadoCriado))}.
          </p>
        ) : null}

        <section className="overview-grid" aria-label="Resumo dos chamados">
          <article className="overview-card overview-open">
            <span className="overview-icon">!</span>
            <div>
              <small>Chamados abertos</small>
              <strong>{quantidadePorStatus("OPEN")}</strong>
              <p>Aguardando atendimento</p>
            </div>
          </article>
          <article className="overview-card overview-progress">
            <span className="overview-icon">↻</span>
            <div>
              <small>Em atendimento</small>
              <strong>{quantidadePorStatus("IN_PROGRESS")}</strong>
              <p>Sendo analisados pela equipe</p>
            </div>
          </article>
          <article className="overview-card overview-resolved">
            <span className="overview-icon">✓</span>
            <div>
              <small>Chamados resolvidos</small>
              <strong>{quantidadePorStatus("RESOLVED")}</strong>
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
                placeholder="Buscar por assunto ou protocolo"
                aria-label="Buscar chamados"
                value={busca}
                onChange={(evento) => definirBusca(evento.target.value)}
              />
            </label>
          </div>

          <div
            className="filter-tabs"
            role="tablist"
            aria-label="Filtrar chamados"
          >
            {filtros.map((filtro) => (
              <button
                className={filtroAtivo === filtro.status ? "active" : ""}
                key={filtro.status}
                type="button"
                onClick={() => definirFiltroAtivo(filtro.status)}
              >
                {filtro.rotulo}{" "}
                <span>{quantidadePorStatus(filtro.status)}</span>
              </button>
            ))}
          </div>

          {erro ? (
            <p className="form-message form-message-error">{erro}</p>
          ) : carregando ? (
            <div className="empty-state user-empty-state">
              <p>Carregando chamados...</p>
            </div>
          ) : chamadosFiltrados.length ? (
            <div className="ticket-list">
              {chamadosFiltrados.map((chamado) => (
                <TicketCard key={chamado.id} ticket={chamado} />
              ))}
            </div>
          ) : (
            <div className="empty-state user-empty-state">
              <span className="empty-icon">▤</span>
              <h3>
                {chamados.length
                  ? "Nenhum chamado encontrado"
                  : "Você ainda não possui chamados"}
              </h3>
              <p>
                {chamados.length
                  ? "Tente alterar a busca ou o filtro selecionado."
                  : "Quando uma solicitação for aberta, ela aparecerá nesta lista."}
              </p>
              {!chamados.length ? (
                <Link className="primary-button" href="/tickets/new">
                  Abrir primeiro chamado
                </Link>
              ) : null}
            </div>
          )}
        </section>
      </Header>
    </>
  );
}
