import Head from "next/head";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function TicketDetailsPage() {
  return (
    <>
      <Head>
        <title>Detalhes do chamado | HelpDesk</title>
      </Head>
      <Header>
        <Link className="back-link" href="/home#tickets">
          ← Voltar para meus chamados
        </Link>
        <section className="empty-state detail-empty">
          <span className="empty-icon">▤</span>
          <h1>Detalhes indisponíveis</h1>
          <p>
            Os dados deste chamado serão exibidos depois da integração com a
            API.
          </p>
          <Link className="primary-button" href="/home">
            Voltar ao início
          </Link>
        </section>
      </Header>
    </>
  );
}
