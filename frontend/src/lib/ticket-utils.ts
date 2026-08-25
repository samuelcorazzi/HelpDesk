export const ticketStatusLabel = {
  // Rótulos usados na interface para os valores técnicos do banco.
  OPEN: "Aberto",
  IN_PROGRESS: "Em atendimento",
  RESOLVED: "Resolvido",
} as const;
// "as const" preserva cada valor como literal, ajudando o TypeScript a impedir
// acessos com chaves de status que não existem.

export const urgencyLabel = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
} as const;

export function formatProtocol(sequenceNumber: number) {
  // O banco guarda somente o inteiro sequencial. "HD-" e os zeros são uma
  // formatação visual, portanto não precisam ocupar outra coluna na tabela.
  return `HD-${String(sequenceNumber).padStart(6, "0")}`;
}

export function formatDate(date: string) {
  // A API transmite datas ISO; Intl aplica idioma e fuso apenas na apresentação.
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(date));
}
