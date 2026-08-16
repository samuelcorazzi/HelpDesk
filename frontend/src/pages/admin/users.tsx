import { Header } from '@/components/Header';

export default function AdminUsersPage() {
  return (
    <Header area="admin">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administração</p>
          <h1>Usuários</h1>
        </div>
        <button type="button">Novo usuário</button>
      </div>
      <section className="empty-state">
        <h2>Nenhum usuário carregado</h2>
        <p>O gerenciamento será conectado à API REST.</p>
      </section>
    </Header>
  );
}
