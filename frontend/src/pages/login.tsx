import Head from "next/head";
import { useRouter } from "next/router";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";
import type { LoginResponse } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      localStorage.setItem("helpdesk_token", response.accessToken);
      localStorage.setItem("helpdesk_user", JSON.stringify(response.user));

      await router.push(response.user.role === "ADMIN" ? "/admin" : "/home");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível entrar.",
      );
    } finally {
      setLoading(false);
    }
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
            {error ? <p className="form-error">{error}</p> : null}
            <button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="notice">
            Não possui conta? Solicite a criação ao administrador.
          </p>
        </section>
      </main>
    </>
  );
}
