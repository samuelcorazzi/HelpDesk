import Link from 'next/link';
import { Header } from '@/components/Header';

export default function HomePage() {
  return (
    <Header>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Portal do usuário</p>
          <h1>Meus chamados</h1>
        </div>
        <Link className="button" href="/tickets/new">
          Abrir chamado
        </Link>
      </div>
      <section className="empty-state">
        <h2>Nenhum chamado carregado</h2>
        <p>A integração com a API será feita durante o desenvolvimento.</p>
      </section>
    </Header>
  );
}
