import Head from "next/head";
// Formulário de abertura de chamado pelo usuario, upload aqui é opcional
// imports abaixo, permitem usar algo criado em outro arquivo etc...
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Header } from "@/components/Header";
import { apiRequest } from "@/lib/api";
import type { Ticket } from "@/lib/types";

const TAMANHO_MAXIMO_ANEXO = 5 * 1024 * 1024;

//pagina inteira de criação do chamado

export default function NewTicketPage() {
  const roteador = useRouter(); //router permite trocar de pagina pelo codigo
  const [nomeAnexo, definirNomeAnexo] = useState(""); //informação muda enquanto tela esta aberta, devolve valor atual e funcao pra mudar
  const [erro, definirErro] = useState("");
  const [enviando, definirEnviando] = useState(false); //envio inicia quando usuario clica no botao de enviar

  function selecionarAnexo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]; //registro de algo que ocorreu na tela , codigo nao quebra se prosseguir sem nenhum arquivo selecionado
    definirErro("");

    if (arquivo && arquivo.size > TAMANHO_MAXIMO_ANEXO) {
      // Limpar value permite que o mesmo arquivo seja selecionado novamente depois.
      evento.target.value = "";
      definirNomeAnexo("");
      definirErro("O anexo deve ter no máximo 5 MB.");
      return;
    }

    definirNomeAnexo(arquivo?.name ?? ""); //
  }

  // O envio do formulário chama esta função sem recarregar a página
  async function enviarChamado(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); //evita que o sistema recarrega a pagina devido a demora
    definirErro("");
    definirEnviando(true); //prepara a tela antes da requisicao

    try {
      // FormData reune os campos e o arquivo para envia-los ao controller de
      // chamados. o navegador define automaticamente o tipo de conteúdo correto.
      const chamado = await apiRequest<Ticket>("/chamados", {
        method: "POST", //criar um novo chamado com esses dados
        body: new FormData(evento.currentTarget),
      });

      // Depois da confirmação, /home recebe o número e o exibe como.

      // Redireciona o usuário para a página inicial e envia o protocolo pela URL
      // para que a mensagem de chamado criado seja exibida.
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
