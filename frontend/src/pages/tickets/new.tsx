import { Header } from '@/components/Header';

export default function NewTicketPage() {
  return (
    <Header>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Nova solicitação</p>
          <h1>Abrir chamado</h1>
        </div>
      </div>
      <form className="panel form-grid">
        <label>
          Assunto
          <input name="subject" maxLength={150} required />
        </label>
        <label>
          Descrição
          <textarea name="description" rows={7} required />
        </label>
        <label>
          Urgência
          <select name="urgency" defaultValue="MEDIUM">
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
        </label>
        <label>
          Anexo
          <input
            type="file"
            name="attachment"
            accept=".pdf,.png,.jpg,.jpeg"
          />
        </label>
        <button type="button">Enviar chamado</button>
      </form>
    </Header>
  );
}
