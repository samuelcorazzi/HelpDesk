import type { Ticket, User } from "./types";

export const demoUser: User = {
  id: "demo-user",
  name: "João Silva",
  email: "usuario@helpdesk.local",
  role: "USER",
  active: true,
};

export const demoPassword = "Usuario@123";

export const demoTickets: Ticket[] = [
  {
    id: "1",
    sequenceNumber: 1042,
    subject: "Computador reiniciando sozinho",
    description:
      "O computador do setor financeiro reinicia algumas vezes durante o expediente, principalmente ao abrir planilhas grandes.",
    urgency: "HIGH",
    status: "IN_PROGRESS",
    createdAt: "2026-08-16T12:30:00.000Z",
    updatedAt: "2026-08-16T15:45:00.000Z",
  },
  {
    id: "2",
    sequenceNumber: 1038,
    subject: "Acesso ao sistema de notas",
    description:
      "Não consigo acessar o sistema de notas desde a troca da minha senha institucional.",
    urgency: "MEDIUM",
    status: "OPEN",
    createdAt: "2026-08-15T14:10:00.000Z",
    updatedAt: "2026-08-15T14:10:00.000Z",
  },
  {
    id: "3",
    sequenceNumber: 1027,
    subject: "Instalação da impressora da secretaria",
    description:
      "Solicitação de instalação e configuração da nova impressora da secretaria acadêmica.",
    urgency: "LOW",
    status: "RESOLVED",
    createdAt: "2026-08-12T09:20:00.000Z",
    updatedAt: "2026-08-13T16:30:00.000Z",
  },
  {
    id: "4",
    sequenceNumber: 1019,
    subject: "Internet lenta no laboratório 03",
    description:
      "A conexão fica muito lenta quando a turma utiliza os computadores do laboratório ao mesmo tempo.",
    urgency: "HIGH",
    status: "RESOLVED",
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-11T11:15:00.000Z",
  },
];

export const ticketStatusLabel = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em atendimento",
  RESOLVED: "Resolvido",
} as const;

export const urgencyLabel = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
} as const;

export function formatProtocol(sequenceNumber: number) {
  return `HD-${String(sequenceNumber).padStart(6, "0")}`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
