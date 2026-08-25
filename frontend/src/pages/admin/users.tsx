import Head from "next/head";
// Administração de usuários: lista contas e cria novas contas pelo endpoint protegido.
import { useEffect, useState, type FormEvent } from "react";
import { Header } from "@/components/Header";
import { apiRequest } from "@/lib/api";
import type { Role, User } from "@/lib/types";

const rotuloPapel: Record<Role, string> = {
  USER: "Usuário",
  ADMIN: "Administrador",
};

export default function PaginaUsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const resposta = await apiRequest<User[]>("/users");
        setUsuarios(resposta);
      } catch (erroRequisicao) {
        setErro(
          erroRequisicao instanceof Error
            ? erroRequisicao.message
            : "Não foi possível carregar os usuários.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarUsuarios();
  }, []);

  async function cadastrarUsuario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setErro("");
    setMensagem("");

    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);

    try {
      const usuarioCriado = await apiRequest<User>("/users", {
        method: "POST",
        body: JSON.stringify({
          name: dados.get("name"),
          email: dados.get("email"),
          password: dados.get("password"),
          role: dados.get("role"),
        }),
      });

      setUsuarios((usuariosAtuais) => [usuarioCriado, ...usuariosAtuais]);
      setMensagem("Usuário cadastrado com sucesso.");
      formulario.reset();
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao instanceof Error
          ? erroRequisicao.message
          : "Não foi possível cadastrar o usuário.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Head>
        <title>Usuários | HelpDesk</title>
      </Head>
      <Header area="admin">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Administração</p>
            <h1>Usuários</h1>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => setMostrarFormulario((valorAtual) => !valorAtual)}
          >
            {mostrarFormulario ? "Fechar cadastro" : "+ Novo usuário"}
          </button>
        </div>

        {mostrarFormulario ? (
          <section className="user-form-panel">
            <div className="form-section-heading">
              <span>+</span>
              <div>
                <h2>Cadastrar novo usuário</h2>
                <p>Somente administradores possuem acesso a este formulário.</p>
              </div>
            </div>

            <form className="admin-user-form" onSubmit={cadastrarUsuario}>
              <label>
                Nome completo
                <input
                  name="name"
                  minLength={2}
                  maxLength={120}
                  placeholder="Nome do usuário"
                  required
                />
              </label>

              <label>
                E-mail
                <input
                  type="email"
                  name="email"
                  maxLength={180}
                  placeholder="usuario@empresa.com"
                  required
                />
              </label>

              <label>
                Senha inicial
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="Mínimo de 8 caracteres"
                  required
                />
              </label>

              <label>
                Tipo de acesso
                <select name="role" defaultValue="USER" required>
                  <option value="USER">Usuário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>

              <button
                className="primary-button"
                type="submit"
                disabled={enviando}
              >
                {enviando ? "Cadastrando..." : "Cadastrar usuário"}
              </button>
            </form>
          </section>
        ) : null}

        {erro ? (
          <p className="form-message form-message-error">{erro}</p>
        ) : null}
        {mensagem ? (
          <p className="form-message form-message-success">{mensagem}</p>
        ) : null}

        <section className="users-list-panel">
          <div className="users-list-heading">
            <div>
              <h2>Usuários cadastrados</h2>
              <p>Contas com acesso ao sistema HelpDesk.</p>
            </div>
            <strong>{usuarios.length}</strong>
          </div>

          {carregando ? (
            <p className="users-feedback">Carregando usuários...</p>
          ) : usuarios.length === 0 ? (
            <div className="users-feedback">
              <p>Nenhum usuário cadastrado.</p>
            </div>
          ) : (
            <div className="users-list">
              {usuarios.map((usuario) => (
                <article className="user-row" key={usuario.id}>
                  <span className="user-avatar">
                    {usuario.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="user-row-identity">
                    <strong>{usuario.name}</strong>
                    <small>{usuario.email}</small>
                  </div>
                  <span
                    className={`role-badge role-${usuario.role.toLowerCase()}`}
                  >
                    {rotuloPapel[usuario.role]}
                  </span>
                  <span
                    className={`account-status ${usuario.active ? "account-active" : "account-inactive"}`}
                  >
                    {usuario.active ? "Ativo" : "Desativado"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </Header>
    </>
  );
}
