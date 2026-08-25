import { useCallback, useEffect, useState } from "react";
import { consultarStatusApi, type StatusConexao } from "@/lib/api";

interface StatusConexaoProps {
  compacto?: boolean;
}

export function ConnectionStatus({ compacto = false }: StatusConexaoProps) {
  const [status, definirStatus] = useState<StatusConexao | null>(null);
  const [verificando, definirVerificando] = useState(false);

  const atualizarManualmente = useCallback(async () => {
    definirVerificando(true);
    definirStatus(await consultarStatusApi());
    definirVerificando(false);
  }, []);

  useEffect(() => {
    let componenteAtivo = true;
    const atualizarAutomaticamente = () => {
      void consultarStatusApi().then((novoStatus) => {
        if (componenteAtivo) definirStatus(novoStatus);
      });
    };

    atualizarAutomaticamente();
    const intervalo = window.setInterval(atualizarAutomaticamente, 30000);
    window.addEventListener("online", atualizarAutomaticamente);

    return () => {
      componenteAtivo = false;
      window.clearInterval(intervalo);
      window.removeEventListener("online", atualizarAutomaticamente);
    };
  }, []);

  const conectado = status?.servidorConectado && status.bancoConectado;
  const rotulo = !status
    ? "Verificando conexão..."
    : conectado
      ? "Servidor e banco conectados"
      : status.servidorConectado
        ? "Banco desconectado"
        : "Servidor desconectado";

  return (
    <button
      className={`connection-status ${conectado ? "connection-online" : status ? "connection-offline" : "connection-checking"} ${compacto ? "connection-compact" : ""}`}
      type="button"
      title={
        status
          ? `${rotulo}. Última verificação: ${new Date(status.verificadoEm).toLocaleTimeString("pt-BR")}`
          : rotulo
      }
      aria-label={`${rotulo}. Clique para atualizar.`}
      disabled={verificando}
      onClick={() => void atualizarManualmente()}
    >
      <span className="connection-dot" aria-hidden="true" />
      {!compacto ? (
        <span>{verificando ? "Verificando..." : rotulo}</span>
      ) : null}
    </button>
  );
}
