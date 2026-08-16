export type Role = "USER" | "ADMIN";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type Urgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
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
  createdAt: string;
  updatedAt: string;
}
