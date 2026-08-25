import {
  // Contrato e validações para criação de usuários.
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
