import Head from "next/head";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function NewTicketPage() {
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
          <form className="ticket-form">
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
                name="subject"
                maxLength={150}
                placeholder="Resuma o problema em uma frase"
                required
              />
              <small className="field-help">Seja direto e objetivo.</small>
            </label>

            <label>
              Descrição do problema
              <textarea
                name="description"
                rows={7}
                placeholder="Descreva o que aconteceu, quando começou e o que você já tentou fazer..."
                required
              />
            </label>

            <label>
              Nível de urgência
              <select name="urgency" defaultValue="MEDIUM">
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </label>

            <label className="upload-field">
              <input
                type="file"
                name="attachment"
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <span className="upload-icon">⇧</span>
              <strong>Arraste um arquivo ou clique para selecionar</strong>
              <small>PNG, JPG ou PDF</small>
            </label>

            <p className="integration-notice">
              O envio será habilitado quando a API de chamados estiver pronta.
            </p>

            <div className="form-actions">
              <Link className="secondary-button" href="/home">
                Cancelar
              </Link>
              <button className="primary-button" type="button" disabled>
                Enviar chamado <span>→</span>
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
