import Link from "next/link";
// Cartão reutilizável que resume um chamado e leva à página de detalhes.
import type { Ticket } from "@/lib/types";
import {
  formatDate,
  formatProtocol,
  ticketStatusLabel,
  urgencyLabel,
} from "@/lib/ticket-utils";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link className="ticket-card" href={`/tickets/${ticket.id}`}>
      <div className="ticket-main">
        <div className="ticket-heading">
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
        <strong className="ticket-title">{ticket.subject}</strong>
        <p>{ticket.description}</p>
        <div className="ticket-meta">
          <span>Aberto em {formatDate(ticket.createdAt)}</span>
          <span className={`urgency urgency-${ticket.urgency.toLowerCase()}`}>
            Urgência {urgencyLabel[ticket.urgency].toLowerCase()}
          </span>
        </div>
      </div>
      <span className="ticket-arrow">›</span>
    </Link>
  );
}
