import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
// Contrato validado do corpo enviado para realizar login.

export class LoginDto {
  // Os decorators de class-validator são executados pelo ValidationPipe antes
  // do método do controlador. Uma entrada inválida gera HTTP 400 automaticamente.
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  // O bcrypt trabalha com até 72 bytes; este projeto também exige ao menos 8
  // caracteres como regra mínima para as senhas cadastradas.
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
