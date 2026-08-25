const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
// Cliente HTTP centralizado: adiciona JWT, trata JSON e padroniza erros.

async function obterMensagemErro(response: Response) {
  // O Nest pode devolver message como texto ou como lista de erros de validação.
  // Esta função converte os dois formatos em uma única mensagem para a tela.
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
  // Headers começa com qualquer cabeçalho específico recebido em options.
  const headers = new Headers(options.headers);
  const enviandoFormulario =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("helpdesk_token")
      : null;

  if (!enviandoFormulario && !headers.has("Content-Type")) {
    // Não definir manualmente o Content-Type de FormData: o navegador precisa
    // acrescentar sozinho o boundary que separa campos e arquivo no multipart.
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    // O backend extrai este Bearer token por meio da Estratégia JWT.
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await obterMensagemErro(response));
  }

  // T existe apenas no TypeScript e documenta o contrato esperado por quem
  // chamou a função; em tempo de execução os dados continuam vindo do JSON.
  return response.json() as Promise<T>;
}

export async function baixarArquivoApi(path: string, nomeArquivo: string) {
  // Downloads não passam por apiRequest porque a resposta é binária (Blob), não JSON.
  const token = localStorage.getItem("helpdesk_token");
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) throw new Error(await obterMensagemErro(response));

  const enderecoTemporario = URL.createObjectURL(await response.blob());
  // Um link temporário simula o clique de download sem navegar para fora da tela.
  const link = document.createElement("a");
  link.href = enderecoTemporario;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Libera a URL em memória depois que o navegador iniciou o download.
  URL.revokeObjectURL(enderecoTemporario);
}
