import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    return this.prisma.note.create({
      data: createNoteDto,
    });
  }

  async findAll(): Promise<Note[]> {
    return this.prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Note> {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }

    return note;
  }

  async update(id: number, updateNoteDto: UpdateNoteDto): Promise<Note> {
    try {
      return await this.prisma.note.update({
        where: { id },
        data: updateNoteDto,
      });
    } catch {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.note.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
  }
}
