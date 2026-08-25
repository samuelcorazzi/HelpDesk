export type Role = "USER" | "ADMIN";
// Tipos que espelham os contratos públicos devolvidos pela API NestJS.
// Se um enum ou campo mudar no backend, este arquivo deve mudar junto para o
// TypeScript avisar quais telas precisam ser adaptadas.
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type Urgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface Ticket {
  id: string;
  sequenceNumber: number;
  subject: string;
  description: string;
  urgency: Urgency;
  status: TicketStatus;
  // Pick reaproveita somente a parte pública de User devolvida dentro do chamado.
  // As interrogações indicam relações que nem toda resposta precisa incluir.
  user?: Pick<User, "name" | "email">;
  attachments?: Attachment[];
  mensagens?: MensagemChamado[];
  createdAt: string;
  updatedAt: string;
}

export interface MensagemChamado {
  id: string;
  conteudo: string;
  criadoEm: string;
  autor: Pick<User, "name" | "role">;
}

export interface Attachment {
  id: string;
  fileName: string;
  size: number;
}
