import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), NotesModule],
})
export class AppModule {}
