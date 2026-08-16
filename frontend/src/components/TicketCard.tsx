import Link from 'next/link';
import type { Ticket } from '@/lib/types';

const statusLabel = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em atendimento',
  RESOLVED: 'Resolvido',
} as const;

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link className="ticket-card" href={`/tickets/${ticket.id}`}>
      <span className="protocol">
        HD-{String(ticket.sequenceNumber).padStart(6, '0')}
      </span>
      <strong>{ticket.subject}</strong>
      <span className={`badge badge-${ticket.status.toLowerCase()}`}>
        {statusLabel[ticket.status]}
      </span>
    </Link>
  );
}
