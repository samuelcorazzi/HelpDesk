import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class DadosEntradaDto {
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
