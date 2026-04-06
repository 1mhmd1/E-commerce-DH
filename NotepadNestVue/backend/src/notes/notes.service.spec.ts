import { NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotesService', () => {
  let service: NotesService;
  let prisma: PrismaService;

  beforeEach(() => {
    // Mock Prisma service
    prisma = {
      note: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as PrismaService;

    service = new NotesService(prisma);
  });

  it('creates and returns a note', async () => {
    const mockNote = {
      id: 1,
      title: 'Hello',
      content: 'World',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.note.create as jest.Mock).mockResolvedValue(mockNote);

    const result = await service.create({ title: 'Hello', content: 'World' });
    expect(result).toEqual(mockNote);
    expect(prisma.note.create).toHaveBeenCalled();
  });

  it('throws when note does not exist', async () => {
    (prisma.note.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
