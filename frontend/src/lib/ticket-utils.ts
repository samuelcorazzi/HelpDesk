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
