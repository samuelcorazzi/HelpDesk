import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { CreateUserDto, UpdateUserDto } from './users.dto';

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const email = this.normalizeEmail(dto.email);
    await this.ensureEmailIsAvailable(email);

    return this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash: await bcrypt.hash(dto.password, 12),
        role: dto.role,
      },
      select: publicUserSelect,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: publicUserSelect,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  findByEmailForAuthentication(email: string) {
    return this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(email) },
    });
  }

  findByIdForAuthentication(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const currentUser = await this.findOne(id);
    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.password !== undefined) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    if (dto.email !== undefined) {
      const email = this.normalizeEmail(dto.email);

      if (email !== currentUser.email) {
        await this.ensureEmailIsAvailable(email);
      }

      data.email = email;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  }

  async updateStatus(id: string, active: boolean) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { active },
      select: publicUserSelect,
    });
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private async ensureEmailIsAvailable(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }
  }
}
