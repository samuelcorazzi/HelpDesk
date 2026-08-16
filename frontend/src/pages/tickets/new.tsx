import Head from "next/head";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Header } from "@/components/Header";

export default function NewTicketPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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

        {submitted ? (
          <section className="success-panel">
            <span className="success-icon">✓</span>
            <p className="eyebrow">Chamado registrado</p>
            <h1>Solicitação enviada com sucesso!</h1>
            <p>
              Seu protocolo demonstrativo é <strong>HD-001043</strong>. Você
              poderá acompanhar o andamento na página inicial.
            </p>
            <div className="success-actions">
              <Link className="primary-button" href="/home">
                Ver meus chamados
              </Link>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setSubmitted(false)}
              >
                Abrir outro chamado
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="form-page-heading">
              <p className="eyebrow">Nova solicitação</p>
              <h1>Como podemos ajudar?</h1>
              <p>
                Conte o que aconteceu e envie o máximo de detalhes possível.
              </p>
            </section>

            <div className="ticket-form-layout">
              <form className="ticket-form" onSubmit={handleSubmit}>
                <div className="form-section-heading">
                  <span>1</span>
                  <div>
                    <h2>Informações do chamado</h2>
                    <p>
                      Preencha os campos abaixo para registrar sua solicitação.
                    </p>
                  </div>
                </div>

                <div className="form-grid two-columns">
                  <label>
                    Categoria
                    <select name="category" defaultValue="">
                      <option value="" disabled>
                        Selecione uma categoria
                      </option>
                      <option>Hardware</option>
                      <option>Software</option>
                      <option>Acesso e senha</option>
                      <option>Rede e internet</option>
                      <option>Outros</option>
                    </select>
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

                <label className="upload-field">
                  <input
                    type="file"
                    name="attachment"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  <span className="upload-icon">⇧</span>
                  <strong>Arraste um arquivo ou clique para selecionar</strong>
                  <small>PNG, JPG ou PDF · máximo de 10 MB</small>
                </label>

                <div className="form-actions">
                  <Link className="secondary-button" href="/home">
                    Cancelar
                  </Link>
                  <button className="primary-button" type="submit">
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
                <div className="response-time">
                  <small>Tempo médio de resposta</small>
                  <strong>Até 4 horas úteis</strong>
                </div>
              </aside>
            </div>
          </>
        )}
      </Header>
    </>
  );
}
