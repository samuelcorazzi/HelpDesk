import Head from "next/head";
// Dashboard administrativo: acompanha todos os chamados e altera seus status.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { apiRequest } from "@/lib/api";
import {
  formatDate,
  formatProtocol,
  ticketStatusLabel,
  urgencyLabel,
} from "@/lib/ticket-utils";
import type { Ticket, TicketStatus } from "@/lib/types";

const opcoesStatus: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];

export default function PaginaPainelAdmin() {
  const [chamados, definirChamados] = useState<Ticket[]>([]);
  const [busca, definirBusca] = useState("");
  const [carregando, definirCarregando] = useState(true);
  const [chamadoAtualizando, definirChamadoAtualizando] = useState("");
  const [erro, definirErro] = useState("");
  const [mensagem, definirMensagem] = useState("");

  useEffect(() => {
    // O endpoint é o mesmo usado pelo usuário. É o backend que percebe o papel
    // ADMIN no token e, nesse caso, não aplica o filtro por proprietário.
    async function carregarChamados() {
      try {
        definirChamados(await apiRequest<Ticket[]>("/chamados"));
      } catch (erroRequisicao) {
        definirErro(
          erroRequisicao instanceof Error
            ? erroRequisicao.message
            : "Não foi possível carregar os chamados.",
        );
      } finally {
        definirCarregando(false);
      }
    }

    void carregarChamados();
  }, []);

  const chamadosFiltrados = useMemo(() => {
    // A busca administrativa também considera os dados do solicitante.
    const termo = busca.trim().toLowerCase();
    if (!termo) return chamados;

    return chamados.filter(
      (chamado) =>
        chamado.subject.toLowerCase().includes(termo) ||
        chamado.user?.name.toLowerCase().includes(termo) ||
        chamado.user?.email.toLowerCase().includes(termo) ||
        formatProtocol(chamado.sequenceNumber).toLowerCase().includes(termo),
    );
  }, [busca, chamados]);

  const quantidadePorStatus = (status: TicketStatus) =>
    chamados.filter((chamado) => chamado.status === status).length;

  async function alterarStatus(chamado: Ticket, novoStatus: TicketStatus) {
    if (novoStatus === chamado.status) return;

    definirErro("");
    definirMensagem("");
    definirChamadoAtualizando(chamado.id);

    try {
      // Só ADMIN passa pelo GuardaPapeis deste endpoint no backend.
      const chamadoAtualizado = await apiRequest<Ticket>(
        `/chamados/${chamado.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: novoStatus }),
        },
      );

      definirChamados((chamadosAtuais) =>
        // Substitui localmente apenas a linha alterada, evitando buscar a lista toda.
        chamadosAtuais.map((item) =>
          item.id === chamado.id ? chamadoAtualizado : item,
        ),
      );
      definirMensagem(
        `${formatProtocol(chamado.sequenceNumber)} atualizado para ${ticketStatusLabel[novoStatus].toLowerCase()}.`,
      );
    } catch (erroRequisicao) {
      definirErro(
        erroRequisicao instanceof Error
          ? erroRequisicao.message
          : "Não foi possível atualizar o chamado.",
      );
    } finally {
      definirChamadoAtualizando("");
    }
  }

  return (
    <>
      <Head>
        <title>Administração | HelpDesk</title>
      </Head>
      <Header area="admin">
        <div className="page-heading admin-dashboard-heading">
          <div>
            <p className="eyebrow">Administração</p>
            <h1>Dashboard</h1>
            <p className="muted">
              Acompanhe e atualize as solicitações registradas pelos usuários.
            </p>
          </div>
        </div>

        <section className="stats" aria-label="Indicadores dos chamados">
          <article className="stat">
            <span>Total</span>
            <strong>{chamados.length}</strong>
          </article>
          <article className="stat">
            <span>Abertos</span>
            <strong>{quantidadePorStatus("OPEN")}</strong>
          </article>
          <article className="stat">
            <span>Em atendimento</span>
            <strong>{quantidadePorStatus("IN_PROGRESS")}</strong>
          </article>
          <article className="stat">
            <span>Resolvidos</span>
            <strong>{quantidadePorStatus("RESOLVED")}</strong>
          </article>
        </section>

        {erro ? (
          <p className="form-message form-message-error">{erro}</p>
        ) : null}
        {mensagem ? (
          <p className="form-message form-message-success">{mensagem}</p>
        ) : null}

        <section className="admin-tickets-panel">
          <div className="admin-tickets-heading">
            <div>
              <h2>Chamados recebidos</h2>
              <p>Altere o status conforme o andamento do atendimento.</p>
            </div>
            <label className="search-field">
              <span>⌕</span>
              <input
                type="search"
                value={busca}
                placeholder="Buscar chamado ou usuário"
                aria-label="Buscar chamados administrativos"
                onChange={(evento) => definirBusca(evento.target.value)}
              />
            </label>
          </div>

          {carregando ? (
            <p className="admin-tickets-feedback">Carregando chamados...</p>
          ) : chamadosFiltrados.length ? (
            <div className="admin-tickets-list">
              {chamadosFiltrados.map((chamado) => (
                <article className="admin-ticket-row" key={chamado.id}>
                  <div className="admin-ticket-identity">
                    <span className="protocol">
                      {formatProtocol(chamado.sequenceNumber)}
                    </span>
                    <strong>{chamado.subject}</strong>
                    <small>Aberto em {formatDate(chamado.createdAt)}</small>
                  </div>

                  <div className="admin-ticket-user">
                    <small>Solicitante</small>
                    <strong>{chamado.user?.name ?? "Usuário"}</strong>
                    <span>{chamado.user?.email ?? "E-mail indisponível"}</span>
                  </div>

                  <span
                    className={`urgency urgency-${chamado.urgency.toLowerCase()}`}
                  >
                    {urgencyLabel[chamado.urgency]}
                  </span>

                  <label className="admin-status-control">
                    <span>Status</span>
                    <select
                      value={chamado.status}
                      disabled={chamadoAtualizando === chamado.id}
                      onChange={(evento) =>
                        void alterarStatus(
                          chamado,
                          evento.target.value as TicketStatus,
                        )
                      }
                    >
                      {opcoesStatus.map((status) => (
                        <option key={status} value={status}>
                          {ticketStatusLabel[status]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <Link
                    className="secondary-button admin-ticket-details"
                    href={`/tickets/${chamado.id}`}
                  >
                    Ver detalhes
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-tickets-feedback">
              <p>
                {chamados.length
                  ? "Nenhum chamado corresponde à busca."
                  : "Nenhum chamado foi aberto até o momento."}
              </p>
            </div>
          )}
        </section>
      </Header>
    </>
  );
}
