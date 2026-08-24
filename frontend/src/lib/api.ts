const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export interface StatusConexao {
  servidorConectado: boolean;
  bancoConectado: boolean;
  verificadoEm: string;
  tempoRespostaMs?: number;
}

async function obterMensagemErro(response: Response) {
  const errorBody = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = Array.isArray(errorBody?.message)
    ? errorBody.message.join(" ")
    : errorBody?.message;

  return message ?? `A API respondeu com o status ${response.status}.`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const enviandoFormulario =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("helpdesk_token")
      : null;

  if (!enviandoFormulario && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await obterMensagemErro(response));
  }

  return response.json() as Promise<T>;
}

export async function baixarArquivoApi(path: string, nomeArquivo: string) {
  const token = localStorage.getItem("helpdesk_token");
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) throw new Error(await obterMensagemErro(response));

  const enderecoTemporario = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = enderecoTemporario;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(enderecoTemporario);
}

export async function consultarStatusApi(): Promise<StatusConexao> {
  try {
    const response = await fetch(`${API_URL}/status`, { cache: "no-store" });
    const corpo = (await response.json()) as Partial<StatusConexao>;

    return {
      servidorConectado: corpo.servidorConectado === true,
      bancoConectado: corpo.bancoConectado === true,
      verificadoEm: corpo.verificadoEm ?? new Date().toISOString(),
      tempoRespostaMs: corpo.tempoRespostaMs,
    };
  } catch {
    return {
      servidorConectado: false,
      bancoConectado: false,
      verificadoEm: new Date().toISOString(),
    };
  }
}
