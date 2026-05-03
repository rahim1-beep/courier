import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } })],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
