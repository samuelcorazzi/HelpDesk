import type { Ticket, TicketStatus } from '@/lib/types';
import { TicketCard } from './TicketCard';

const columns: Array<{ status: TicketStatus; label: string }> = [
  { status: 'OPEN', label: 'Abertos' },
  { status: 'IN_PROGRESS', label: 'Em atendimento' },
  { status: 'RESOLVED', label: 'Resolvidos' },
];

export function Kanban({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="kanban">
      {columns.map((column) => {
        const items = tickets.filter((ticket) => ticket.status === column.status);

        return (
          <section className="kanban-column" key={column.status}>
            <h2>{column.label}</h2>
            {items.length === 0 ? (
              <p className="empty">Nenhum chamado.</p>
            ) : (
              items.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
            )}
          </section>
        );
      })}
    </div>
  );
}
