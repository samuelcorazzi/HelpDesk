import Head from "next/head";
// Tela de login: armazena o JWT e encaminha conforme o papel retornado pela API.
import { useRouter } from "next/router";
import { useState, type FormEvent } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { apiRequest } from "@/lib/api";
import type { LoginResponse } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        <title>Entrar | HelpDesk</title>
        <meta
          name="description"
          content="Acesse o portal de atendimento HelpDesk."
        />
      </Head>
      <main className="login-layout">
        <section className="login-showcase">
          <div className="login-showcase-content">
            <div className="login-brand">
              <span className="brand-mark brand-mark-light">H</span>
              <span>
                Help<strong>Desk</strong>
              </span>
            </div>
            <div className="showcase-copy">
              <span className="showcase-tag">
                Suporte simples e transparente
              </span>
              <h1>Estamos aqui para ajudar você.</h1>
              <p>
                Abra solicitações, acompanhe cada atualização e encontre suas
                soluções em um só lugar.
              </p>
            </div>
            <div className="showcase-benefits">
              <div>
                <span>✓</span>
                <p>
                  <strong>Acompanhamento fácil</strong>
                  Consulte seus chamados quando precisar.
                </p>
              </div>
              <div>
                <span>✓</span>
                <p>
                  <strong>Atendimento organizado</strong>
                  Cada solicitação recebe um protocolo único.
                </p>
              </div>
            </div>
          </div>
          <p className="showcase-footer">HelpDesk acadêmico · 2026</p>
        </section>

        <section className="login-form-area">
          <ThemeToggle className="login-theme-toggle" />
          <div className="auth-card login-card">
            <div className="mobile-login-brand">
              <span className="brand-mark">H</span> HelpDesk
            </div>
            <p className="eyebrow">Bem-vindo de volta</p>
            <h2>Acesse sua conta</h2>
            <p className="muted login-intro">
              Entre com as credenciais fornecidas pelo administrador.
            </p>

            <form onSubmit={handleSubmit}>
              <label>
                E-mail
                <span className="input-shell">
                  <span className="input-icon">@</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="nome@empresa.com"
                    autoComplete="email"
                    required
                  />
                </span>
              </label>
              <label>
                Senha
                <span className="input-shell">
                  <span className="input-icon">•</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    minLength={8}
                    required
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </span>
              </label>

              {error ? <p className="form-error">{error}</p> : null}

              <button
                className="primary-button login-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar na plataforma"}
                <span>→</span>
              </button>
            </form>

            <p className="login-help">
              Não possui acesso? <strong>Fale com o administrador.</strong>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
