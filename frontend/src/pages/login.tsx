import Head from 'next/head';
import type { FormEvent } from 'react';

export default function LoginPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <>
      <Head>
        <title>Login | HelpDesk</title>
      </Head>
      <main className="auth-page">
        <section className="auth-card">
          <p className="eyebrow">HelpDesk acadêmico</p>
          <h1>Entrar</h1>
          <p className="muted">Use a conta criada pelo administrador.</p>
          <form onSubmit={handleSubmit}>
            <label>
              E-mail
              <input type="email" name="email" required />
            </label>
            <label>
              Senha
              <input type="password" name="password" required />
            </label>
            <button type="submit">Entrar</button>
          </form>
          <p className="notice">
            A autenticação será implementada na próxima etapa.
          </p>
        </section>
      </main>
    </>
  );
}
