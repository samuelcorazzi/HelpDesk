import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Header } from "@/components/Header";
import {
  demoTickets,
  formatDate,
  formatProtocol,
  ticketStatusLabel,
  urgencyLabel,
} from "@/lib/mock-data";
import type { TicketStatus } from "@/lib/types";

const timeline: Array<{
  status: TicketStatus;
  title: string;
  description: string;
}> = [
  {
    status: "OPEN",
    title: "Chamado aberto",
    description: "Sua solicitação foi registrada e enviada para a equipe.",
  },
  {
    status: "IN_PROGRESS",
    title: "Em atendimento",
    description: "Um técnico está analisando as informações enviadas.",
  },
  {
    status: "RESOLVED",
    title: "Chamado resolvido",
    description: "A solução foi aplicada e o atendimento finalizado.",
  },
];

const statusOrder: Record<TicketStatus, number> = {
  OPEN: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
};

export default function TicketDetailsPage() {
  const router = useRouter();
  const id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;
  const ticket = demoTickets.find((item) => item.id === id);

  return (
    <>
      <Head>
        <title>Detalhes do chamado | HelpDesk</title>
      </Head>
      <Header>
        <Link className="back-link" href="/home#tickets">
          ← Voltar para meus chamados
        </Link>

        {!router.isReady ? (
          <section className="panel">
            <p>Carregando chamado...</p>
          </section>
        ) : !ticket ? (
          <section className="empty-state detail-empty">
            <span className="empty-icon">!</span>
            <h1>Chamado não encontrado</h1>
            <p>Este protocolo não existe nos dados demonstrativos.</p>
            <Link className="primary-button" href="/home">
              Voltar ao início
            </Link>
          </section>
        ) : (
          <>
            <section className="detail-heading">
              <div>
                <div className="detail-protocol-row">
                  <span className="protocol">
                    {formatProtocol(ticket.sequenceNumber)}
                  </span>
                  <span
                    className={`status-badge status-${ticket.status.toLowerCase()}`}
                  >
                    <span className="status-dot" />
                    {ticketStatusLabel[ticket.status]}
                  </span>
                </div>
                <h1>{ticket.subject}</h1>
                <p>Aberto em {formatDate(ticket.createdAt)}</p>
              </div>
              <button className="secondary-button" type="button">
                Adicionar informação
              </button>
            </section>

            <div className="ticket-detail-layout">
              <div className="detail-main-column">
                <section className="detail-card">
                  <h2>Descrição do problema</h2>
                  <p className="detail-description">{ticket.description}</p>
                  <div className="attachment-row">
                    <span className="attachment-icon">▧</span>
                    <div>
                      <strong>captura-do-problema.png</strong>
                      <small>Imagem · 428 KB</small>
                    </div>
                    <button type="button">Baixar</button>
                  </div>
                </section>

                <section className="detail-card">
                  <h2>Andamento do chamado</h2>
                  <div className="timeline">
                    {timeline.map((step, index) => {
                      const reached = index <= statusOrder[ticket.status];
                      const current = index === statusOrder[ticket.status];

                      return (
                        <div
                          className={`timeline-item ${reached ? "reached" : ""}`}
                          key={step.status}
                        >
                          <span className="timeline-marker">
                            {reached ? "✓" : index + 1}
                          </span>
                          <div>
                            <div className="timeline-title-row">
                              <strong>{step.title}</strong>
                              {current ? <span>Etapa atual</span> : null}
                            </div>
                            <p>{step.description}</p>
                            {reached ? (
                              <small>{formatDate(ticket.updatedAt)}</small>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <aside className="detail-side-card">
                <h2>Informações</h2>
                <dl>
                  <div>
                    <dt>Status</dt>
                    <dd>{ticketStatusLabel[ticket.status]}</dd>
                  </div>
                  <div>
                    <dt>Urgência</dt>
                    <dd>{urgencyLabel[ticket.urgency]}</dd>
                  </div>
                  <div>
                    <dt>Categoria</dt>
                    <dd>Hardware</dd>
                  </div>
                  <div>
                    <dt>Solicitante</dt>
                    <dd>João Silva</dd>
                  </div>
                  <div>
                    <dt>Última atualização</dt>
                    <dd>{formatDate(ticket.updatedAt)}</dd>
                  </div>
                </dl>
                <div className="assigned-agent">
                  <span className="user-avatar">M</span>
                  <div>
                    <small>Responsável</small>
                    <strong>Marina Costa</strong>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </Header>
    </>
  );
}
