import {
  // Endpoints administrativos para o ciclo de vida das contas de usuário.
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserDto, UpdateUserDto, UpdateUserStatusDto } from './users.dto';
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

  @Patch(':id')
  atualizar(
    @Param('id', new ParseUUIDPipe()) identificador: string,
    @Body() dadosUsuario: UpdateUserDto,
  ) {
    // PATCH representa atualização parcial: o serviço altera somente os campos
    // realmente presentes no corpo da requisição.
    return this.servicoUsuarios.atualizar(identificador, dadosUsuario);
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id', new ParseUUIDPipe()) identificador: string,
    @Body() dadosStatus: UpdateUserStatusDto,
  ) {
    return this.servicoUsuarios.atualizarStatus(
      identificador,
      dadosStatus.active,
    );
  }
}
