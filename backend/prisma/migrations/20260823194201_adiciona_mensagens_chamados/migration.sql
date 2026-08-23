-- CreateTable
CREATE TABLE "mensagens_chamado" (
    "id" UUID NOT NULL,
    "conteudo" TEXT NOT NULL,
    "chamadoId" UUID NOT NULL,
    "autorId" UUID NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_chamado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mensagens_chamado_chamadoId_criadoEm_idx" ON "mensagens_chamado"("chamadoId", "criadoEm");

-- CreateIndex
CREATE INDEX "mensagens_chamado_autorId_idx" ON "mensagens_chamado"("autorId");

-- AddForeignKey
ALTER TABLE "mensagens_chamado" ADD CONSTRAINT "mensagens_chamado_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_chamado" ADD CONSTRAINT "mensagens_chamado_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
