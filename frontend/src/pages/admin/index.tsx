import { Header } from '@/components/Header';

const indicators = ['Total', 'Abertos', 'Em atendimento', 'Resolvidos'];

export default function AdminDashboardPage() {
  return (
    <Header area="admin">
      <p className="eyebrow">Administração</p>
      <h1>Dashboard</h1>
      <div className="stats">
        {indicators.map((label) => (
          <article className="stat" key={label}>
            <span>{label}</span>
            <strong>0</strong>
          </article>
        ))}
      </div>
    </Header>
  );
}
