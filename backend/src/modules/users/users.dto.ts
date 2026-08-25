import {
  // Contratos e validações para criação, edição e ativação de usuários.
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../generated/prisma/enums';

export class CreateUserDto {
  // O ponto de exclamação informa ao TypeScript que o ValidationPipe preencherá
  // o campo em tempo de execução, mesmo sem um construtor nesta classe.
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserDto {
  // Todos os campos são opcionais porque o PATCH permite alterar só um deles.
  // Quando fornecido, cada campo ainda precisa obedecer às mesmas restrições.
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserStatusDto {
  // Exigir boolean real evita aceitar acidentalmente strings como "false".
  @IsBoolean()
  active!: boolean;
}
