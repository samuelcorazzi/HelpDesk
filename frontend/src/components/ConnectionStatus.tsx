import { useCallback, useEffect, useState } from "react";
import { consultarStatusApi, type StatusConexao } from "@/lib/api";

interface StatusConexaoProps {
  compacto?: boolean;
}

export function ConnectionStatus({ compacto = false }: StatusConexaoProps) {
  // null significa que a primeira verificação ainda não terminou.
  const [status, definirStatus] = useState<StatusConexao | null>(null);
  const [verificando, definirVerificando] = useState(false);

  const atualizarManualmente = useCallback(async () => {
    definirVerificando(true);
    definirStatus(await consultarStatusApi());
    definirVerificando(false);
  }, []);

  useEffect(() => {
    // O efeito consulta imediatamente, repete a cada 30 segundos e também tenta
    // novamente quando o navegador detecta que a internet voltou.
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
      // A limpeza evita timer e atualização de estado após desmontar o componente.
      componenteAtivo = false;
      window.clearInterval(intervalo);
      window.removeEventListener("online", atualizarAutomaticamente);
    };
  }, []);

  // Para o sistema estar operacional, API e banco precisam responder juntos.
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
