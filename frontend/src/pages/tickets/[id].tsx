import { Header } from '@/components/Header';
import { useRouter } from 'next/router';

export default function TicketDetailsPage() {
  const router = useRouter();

  return (
    <Header>
      <p className="eyebrow">Detalhes do chamado</p>
      <h1>Protocolo {router.query.id ?? '...'}</h1>
      <section className="panel">
        <p className="muted">Os dados serão carregados pela API REST.</p>
      </section>
    </Header>
  );
}
