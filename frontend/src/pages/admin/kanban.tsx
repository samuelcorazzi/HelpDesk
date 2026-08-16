import { Header } from '@/components/Header';
import { Kanban } from '@/components/Kanban';

export default function AdminKanbanPage() {
  return (
    <Header area="admin">
      <p className="eyebrow">Administração</p>
      <h1>Kanban de chamados</h1>
      <Kanban tickets={[]} />
    </Header>
  );
}
