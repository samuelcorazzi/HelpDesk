-- CreateTable
CREATE TABLE "registros_login" (
    "id" UUID NOT NULL,
    "usuarioId" UUID,
    "emailInformado" VARCHAR(180) NOT NULL,
    "sucesso" BOOLEAN NOT NULL,
    "enderecoIp" VARCHAR(64),
    "agenteUsuario" VARCHAR(500),
    "motivoFalha" VARCHAR(120),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_login_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registros_login_usuarioId_idx" ON "registros_login"("usuarioId");

-- CreateIndex
CREATE INDEX "registros_login_criadoEm_idx" ON "registros_login"("criadoEm");

-- AddForeignKey
ALTER TABLE "registros_login" ADD CONSTRAINT "registros_login_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
