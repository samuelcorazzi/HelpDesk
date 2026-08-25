import Head from "next/head";
// Detalhe de chamado: reúne dados, anexos, conversa e ações administrativas.
import Link from "next/link";
import { useRouter } from "next/router";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { Header } from "@/components/Header";
import { apiRequest, baixarArquivoApi } from "@/lib/api";
import {
  formatDate,
  formatProtocol,
  ticketStatusLabel,
  urgencyLabel,
} from "@/lib/ticket-utils";
import type {
  Attachment,
  MensagemChamado,
  Ticket,
  TicketStatus,
  User,
} from "@/lib/types";

const opcoesStatus: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];
const assinarArmazenamento = () => () => undefined;
const obterAdministradorNoServidor = () => false;

function obterAdministradorNoCliente() {
  try {
    const usuarioArmazenado = localStorage.getItem("helpdesk_user");
    const usuario = usuarioArmazenado
      ? (JSON.parse(usuarioArmazenado) as User)
      : null;
    return usuario?.role === "ADMIN";
  } catch {
    return false;
  }
}

function formatarTamanho(tamanho: number) {
  if (tamanho < 1024) return `${tamanho} bytes`;
  if (tamanho < 1024 * 1024) return `${(tamanho / 1024).toFixed(1)} KB`;
  return `${(tamanho / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TicketDetailsPage() {
  const roteador = useRouter();
  const [chamado, definirChamado] = useState<Ticket | null>(null);
  const [erro, definirErro] = useState("");
  const [carregando, definirCarregando] = useState(true);
  const [anexoBaixando, definirAnexoBaixando] = useState("");
  const [atualizandoStatus, definirAtualizandoStatus] = useState(false);
  const [mensagem, definirMensagem] = useState("");
  const [enviandoMensagem, definirEnviandoMensagem] = useState(false);
  const administrador = useSyncExternalStore(
    assinarArmazenamento,
    obterAdministradorNoCliente,
    obterAdministradorNoServidor,
  );

  useEffect(() => {
    if (!roteador.isReady || typeof roteador.query.id !== "string") return;

    async function carregarChamado(identificador: string) {
      try {
        definirChamado(await apiRequest<Ticket>(`/chamados/${identificador}`));
      } catch (erroCarregamento) {
        definirErro(
          erroCarregamento instanceof Error
            ? erroCarregamento.message
            : "Não foi possível carregar o chamado.",
        );
      } finally {
        definirCarregando(false);
      }
    }

    void carregarChamado(roteador.query.id);
  }, [roteador.isReady, roteador.query.id]);

  async function baixarAnexo(anexo: Attachment) {
    if (!chamado) return;

    definirErro("");
    definirAnexoBaixando(anexo.id);
    try {
      await baixarArquivoApi(
        `/chamados/${chamado.id}/anexos/${anexo.id}`,
        anexo.fileName,
      );
    } catch (erroDownload) {
      definirErro(
        erroDownload instanceof Error
          ? erroDownload.message
          : "Não foi possível baixar o anexo.",
      );
    } finally {
      definirAnexoBaixando("");
    }
  }

  async function alterarStatus(novoStatus: TicketStatus) {
    if (!chamado || novoStatus === chamado.status) return;

    definirErro("");
    definirMensagem("");
    definirAtualizandoStatus(true);

    try {
      const chamadoAtualizado = await apiRequest<Ticket>(
        `/chamados/${chamado.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: novoStatus }),
        },
      );
      definirChamado((chamadoAtual) =>
        chamadoAtual
          ? {
              ...chamadoAtual,
              ...chamadoAtualizado,
              mensagens: chamadoAtual.mensagens,
            }
          : chamadoAtualizado,
      );
      definirMensagem(
        `Status atualizado para ${ticketStatusLabel[novoStatus].toLowerCase()}.`,
      );
    } catch (erroAtualizacao) {
      definirErro(
        erroAtualizacao instanceof Error
          ? erroAtualizacao.message
          : "Não foi possível atualizar o status.",
      );
    } finally {
      definirAtualizandoStatus(false);
    }
  }

  async function enviarMensagem(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!chamado) return;

    const formulario = evento.currentTarget;
    const dadosFormulario = new FormData(formulario);
    const conteudo = String(dadosFormulario.get("conteudo") ?? "").trim();
    if (!conteudo) return;

    definirErro("");
    definirMensagem("");
    definirEnviandoMensagem(true);

    try {
      const novaMensagem = await apiRequest<MensagemChamado>(
        `/chamados/${chamado.id}/mensagens`,
        {
          method: "POST",
          body: JSON.stringify({ conteudo }),
        },
      );

      definirChamado((chamadoAtual) =>
        chamadoAtual
          ? {
              ...chamadoAtual,
              updatedAt: novaMensagem.criadoEm,
              mensagens: [...(chamadoAtual.mensagens ?? []), novaMensagem],
            }
          : chamadoAtual,
      );
      definirMensagem("Mensagem enviada com sucesso.");
      formulario.reset();
    } catch (erroEnvio) {
      definirErro(
        erroEnvio instanceof Error
          ? erroEnvio.message
          : "Não foi possível enviar a mensagem.",
      );
    } finally {
      definirEnviandoMensagem(false);
    }
  }

  return (
    <>
      <Head>
        <title>Detalhes do chamado | HelpDesk</title>
      </Head>
      <Header area="auto">
        <Link
          className="back-link"
          href={administrador ? "/admin" : "/home#tickets"}
        >
          ←{" "}
          {administrador
            ? "Voltar ao painel administrativo"
            : "Voltar para meus chamados"}
        </Link>

        {erro ? (
          <p className="form-message form-message-error">{erro}</p>
        ) : null}
        {mensagem ? (
          <p className="form-message form-message-success">{mensagem}</p>
        ) : null}

        {carregando ? (
          <section className="empty-state detail-empty">
            <p>Carregando chamado...</p>
          </section>
        ) : chamado ? (
          <>
            <section className="ticket-detail-heading">
              <div>
                <p className="eyebrow">
                  {formatProtocol(chamado.sequenceNumber)}
                </p>
                <h1>{chamado.subject}</h1>
              </div>
              <span
                className={`status-badge status-${chamado.status.toLowerCase()}`}
              >
                <span className="status-dot" />
                {ticketStatusLabel[chamado.status]}
              </span>
            </section>

            {administrador ? (
              <section className="panel ticket-admin-actions">
                <div>
                  <p className="eyebrow">Operação administrativa</p>
                  <h2>Gerenciar atendimento</h2>
                  <p>
                    Atualize o status conforme o andamento desta solicitação.
                  </p>
                </div>
                <label className="admin-status-control">
                  <span>Status do chamado</span>
                  <select
                    value={chamado.status}
                    disabled={atualizandoStatus}
                    onChange={(evento) =>
                      void alterarStatus(evento.target.value as TicketStatus)
                    }
                  >
                    {opcoesStatus.map((status) => (
                      <option key={status} value={status}>
                        {ticketStatusLabel[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </section>
            ) : null}

            <div className="ticket-detail-layout">
              <article className="panel ticket-description-panel">
                <h2>Descrição</h2>
                <p>{chamado.description}</p>
              </article>

              <aside className="panel ticket-information-panel">
                <h2>Informações</h2>
                <dl>
                  {administrador ? (
                    <div>
                      <dt>Solicitante</dt>
                      <dd>{chamado.user?.name ?? "Usuário"}</dd>
                    </div>
                  ) : null}
                  {administrador ? (
                    <div>
                      <dt>E-mail</dt>
                      <dd>{chamado.user?.email ?? "Indisponível"}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Urgência</dt>
                    <dd>{urgencyLabel[chamado.urgency]}</dd>
                  </div>
                  <div>
                    <dt>Data de abertura</dt>
                    <dd>{formatDate(chamado.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Última atualização</dt>
                    <dd>{formatDate(chamado.updatedAt)}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{ticketStatusLabel[chamado.status]}</dd>
                  </div>
                </dl>
              </aside>
            </div>

            <section className="panel ticket-attachments-panel">
              <h2>Anexos</h2>
              {chamado.attachments?.length ? (
                <div className="attachment-list">
                  {chamado.attachments.map((anexo) => (
                    <div className="attachment-row" key={anexo.id}>
                      <span className="attachment-icon">⇩</span>
                      <span>
                        <strong>{anexo.fileName}</strong>
                        <small>{formatarTamanho(anexo.size)}</small>
                      </span>
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={anexoBaixando === anexo.id}
                        onClick={() => void baixarAnexo(anexo)}
                      >
                        {anexoBaixando === anexo.id ? "Baixando..." : "Baixar"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">Este chamado não possui anexo.</p>
              )}
            </section>

            <section className="panel ticket-conversation-panel">
              <div className="ticket-conversation-heading">
                <div>
                  <p className="eyebrow">Atendimento</p>
                  <h2>Conversa do chamado</h2>
                </div>
                <span>{chamado.mensagens?.length ?? 0} mensagens</span>
              </div>

              {chamado.mensagens?.length ? (
                <div className="ticket-message-list">
                  {chamado.mensagens.map((item) => (
                    <article
                      className={`ticket-message ${item.autor.role === "ADMIN" ? "ticket-message-admin" : "ticket-message-user"}`}
                      key={item.id}
                    >
                      <div>
                        <strong>{item.autor.name}</strong>
                        <span>
                          {item.autor.role === "ADMIN"
                            ? "Administrador"
                            : "Usuário"}
                          {" · "}
                          {formatDate(item.criadoEm)}
                        </span>
                      </div>
                      <p>{item.conteudo}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="ticket-conversation-empty">
                  <p>Ainda não existem mensagens neste chamado.</p>
                </div>
              )}

              <form className="ticket-reply-form" onSubmit={enviarMensagem}>
                <label>
                  {administrador
                    ? "Responder ao solicitante"
                    : "Enviar uma mensagem"}
                  <textarea
                    name="conteudo"
                    rows={4}
                    minLength={1}
                    maxLength={2000}
                    placeholder={
                      administrador
                        ? "Escreva uma orientação ou solicite mais informações..."
                        : "Escreva sua resposta ou acrescente informações..."
                    }
                    required
                  />
                </label>
                <div>
                  <small>Máximo de 2.000 caracteres.</small>
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={enviandoMensagem}
                  >
                    {enviandoMensagem ? "Enviando..." : "Enviar mensagem"}
                  </button>
                </div>
              </form>
            </section>
          </>
        ) : (
          <section className="empty-state detail-empty">
            <span className="empty-icon">▤</span>
            <h1>Chamado não encontrado</h1>
            <p>Confira se o endereço está correto e tente novamente.</p>
          </section>
        )}
      </Header>
    </>
  );
}
