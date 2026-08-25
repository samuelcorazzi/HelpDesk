// Esta página cuida do primeiro passo do chamado: reúne o que o usuário digitou
// e envia os dados, junto com o anexo opcional, para a API.
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Header } from "@/components/Header";
import { apiRequest } from "@/lib/api";
import type { Ticket } from "@/lib/types";

const TAMANHO_MAXIMO_ANEXO = 5 * 1024 * 1024;
// Conferir o tamanho aqui permite avisar o usuário antes do envio. O backend
// confere novamente porque qualquer validação do navegador pode ser contornada.

export default function NewTicketPage() {
  const roteador = useRouter();
  const [nomeAnexo, definirNomeAnexo] = useState("");
  const [erro, definirErro] = useState("");
  const [enviando, definirEnviando] = useState(false);

  function selecionarAnexo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    definirErro("");

    if (arquivo && arquivo.size > TAMANHO_MAXIMO_ANEXO) {
      // Também limpamos o campo para que o navegador perceba caso o usuário
      // corrija o arquivo e tente selecionar o mesmo nome novamente.
      evento.target.value = "";
      definirNomeAnexo("");
      definirErro("O anexo deve ter no máximo 5 MB.");
      return;
    }

    definirNomeAnexo(arquivo?.name ?? "");
  }

  // O formulário é enviado pela própria página para que seja possível mostrar
  // carregamento, sucesso ou erro sem perder tudo o que já estava na tela.
  async function enviarChamado(evento: FormEvent<HTMLFormElement>) {
    // Sem preventDefault, o navegador recarregaria a página ao enviar o formulário.
    evento.preventDefault();
    definirErro("");
    definirEnviando(true);

    try {
      // FormData junta os campos de texto e o arquivo no mesmo envio. O navegador
      // prepara automaticamente o formato que o controller espera receber.
      const chamado = await apiRequest<Ticket>("/chamados", {
        method: "POST",
        body: new FormData(evento.currentTarget),
      });

      // O protocolo volta na resposta e segue pela URL para a tela inicial mostrar
      // qual chamado acabou de ser criado.
      await roteador.push(`/home?chamadoCriado=${chamado.sequenceNumber}`);
    } catch (erroEnvio) {
      definirErro(
        erroEnvio instanceof Error
          ? erroEnvio.message
          : "Não foi possível enviar o chamado.",
      );
    } finally {
      definirEnviando(false);
    }
  }

  return (
    <>
      <Head>
        <title>Abrir chamado | HelpDesk</title>
      </Head>
      <Header>
        <Link className="back-link" href="/home">
          ← Voltar para meus chamados
        </Link>

        <section className="form-page-heading">
          <p className="eyebrow">Nova solicitação</p>
          <h1>Como podemos ajudar?</h1>
          <p>Conte o que aconteceu e envie o máximo de detalhes possível.</p>
        </section>

        <div className="ticket-form-layout">
          <form className="ticket-form" onSubmit={enviarChamado}>
            <div className="form-section-heading">
              <span>1</span>
              <div>
                <h2>Informações do chamado</h2>
                <p>Preencha os campos abaixo para registrar sua solicitação.</p>
              </div>
            </div>

            <label>
              Assunto
              <input
                name="assunto"
                minLength={3}
                maxLength={150}
                placeholder="Resuma o problema em uma frase"
                required
              />
              <small className="field-help">Seja direto e objetivo.</small>
            </label>

            <label>
              Descrição do problema
              <textarea
                name="descricao"
                rows={7}
                minLength={10}
                maxLength={5000}
                placeholder="Descreva o que aconteceu, quando começou e o que você já tentou fazer..."
                required
              />
            </label>

            <label>
              Nível de urgência
              <select name="urgencia" defaultValue="MEDIUM">
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </label>

            <label className="upload-field">
              <input
                type="file"
                name="anexo"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={selecionarAnexo}
              />
              <span className="upload-icon">⇧</span>
              <strong>{nomeAnexo || "Anexe um arquivo, se necessário"}</strong>
              <small>
                {nomeAnexo
                  ? "Arquivo selecionado · clique para trocar"
                  : "Opcional · PNG, JPG ou PDF · máximo de 5 MB"}
              </small>
            </label>

            {erro ? (
              <p className="form-message form-message-error">{erro}</p>
            ) : null}

            <div className="form-actions">
              <Link className="secondary-button" href="/home">
                Cancelar
              </Link>
              <button
                className="primary-button"
                type="submit"
                disabled={enviando}
              >
                {enviando ? "Enviando..." : "Enviar chamado"} <span>→</span>
              </button>
            </div>
          </form>

          <aside className="form-help-card">
            <span className="help-bulb">i</span>
            <h3>Dicas para um atendimento mais rápido</h3>
            <ul>
              <li>Explique exatamente o que estava fazendo.</li>
              <li>Informe mensagens de erro exibidas na tela.</li>
              <li>Anexe uma imagem sempre que possível.</li>
              <li>Escolha a urgência de forma consciente.</li>
            </ul>
          </aside>
        </div>
      </Header>
    </>
  );
}
