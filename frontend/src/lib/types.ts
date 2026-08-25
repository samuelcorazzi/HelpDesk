export type Role = "USER" | "ADMIN";
// Tipos que espelham os contratos públicos devolvidos pela API NestJS.
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
  user?: Pick<User, "id" | "name" | "email">;
  attachments?: Attachment[];
  mensagens?: MensagemChamado[];
  createdAt: string;
  updatedAt: string;
}

export interface MensagemChamado {
  id: string;
  conteudo: string;
  criadoEm: string;
  autor: Pick<User, "id" | "name" | "role">;
}

export interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}
