import {
  // Endpoints administrativos para criar e consultar contas de usuário.
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  // Os decorators na classe protegem todos os endpoints abaixo. Primeiro o JWT
  // identifica a conta; depois RolesGuard confirma que ela é ADMIN.
  constructor(private readonly servicoUsuarios: UsersService) {}

  @Post()
  criar(@Body() dadosUsuario: CreateUserDto) {
    // POST /api/users cria uma conta. O corpo já foi validado pelo DTO.
    return this.servicoUsuarios.criar(dadosUsuario);
  }

  @Get()
  listarTodos() {
    return this.servicoUsuarios.listarTodos();
  }

  @Get(':id')
  buscarPorId(@Param('id', new ParseUUIDPipe()) identificador: string) {
    return this.servicoUsuarios.buscarPorId(identificador);
  }
}
