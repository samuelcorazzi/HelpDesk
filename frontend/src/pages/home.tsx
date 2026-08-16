import Head from "next/head";
import Link from "next/link";
import { Header } from "@/components/Header";

const filters = ["Todos", "Abertos", "Em atendimento", "Resolvidos"];

export default function HomePage() {
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

        <section className="overview-grid" aria-label="Resumo dos chamados">
          <article className="overview-card overview-open">
            <span className="overview-icon">!</span>
            <div>
              <small>Chamados abertos</small>
              <strong>0</strong>
              <p>Aguardando atendimento</p>
            </div>
          </article>
          <article className="overview-card overview-progress">
            <span className="overview-icon">↻</span>
            <div>
              <small>Em atendimento</small>
              <strong>0</strong>
              <p>Sendo analisados pela equipe</p>
            </div>
          </article>
          <article className="overview-card overview-resolved">
            <span className="overview-icon">✓</span>
            <div>
              <small>Chamados resolvidos</small>
              <strong>0</strong>
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
              />
            </label>
          </div>

          <div
            className="filter-tabs"
            role="tablist"
            aria-label="Filtrar chamados"
          >
            {filters.map((filter, index) => (
              <button
                className={index === 0 ? "active" : ""}
                key={filter}
                type="button"
              >
                {filter} <span>0</span>
              </button>
            ))}
          </div>

          <div className="empty-state user-empty-state">
            <span className="empty-icon">▤</span>
            <h3>Você ainda não possui chamados</h3>
            <p>Quando uma solicitação for aberta, ela aparecerá nesta lista.</p>
            <Link className="primary-button" href="/tickets/new">
              Abrir primeiro chamado
            </Link>
          </div>
        </section>
      </Header>
    </>
  );
}
