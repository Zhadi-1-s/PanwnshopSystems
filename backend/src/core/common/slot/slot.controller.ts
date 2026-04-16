import { Controller, Get, Param ,Post,Body, Delete,Patch} from '@nestjs/common';
import { SlotService } from './slot.service';
import { CreateSlotDto } from './create-slot.dto';
import { UpdateSlotStatusDto } from './update-status.dto';
import { Slot } from 'src/core/database/schemas/slot.schema';
import { CloseSlotDto } from './update-status.dto';
@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Post()
  async createSlot(@Body() dto: CreateSlotDto): Promise<Slot> {
    return this.slotService.createSlot(dto);
  }

  @Get()
  getAllSlots() {
    return this.slotService.findAll();
  }

  @Get('user/:userId')
  getSlotsByUser(@Param('userId') userId: string) {
    return this.slotService.findByUserId(userId);
  }

  @Get('pawnshop/:pawnshopId')
  getSlotsByPawnshop(@Param('pawnshopId') pawnshopId: string) {
    return this.slotService.findByPawnshopId(pawnshopId);
  }

  @Get(':id')
  getSlotById(@Param('id') id: string) {
    return this.slotService.findById(id);
  }

  @Delete(':id')
  deleteSlot(@Param('id') id: string) {
    return this.slotService.deleteSlot(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSlotStatusDto,
  ): Promise<Slot> {
    return this.slotService.updateStatus(id, dto);
  }
  @Patch(':id/close')
  closeSlot(
    @Param('id') id: string,
    @Body() dto: CloseSlotDto
  ) {
    return this.slotService.closeSlot(
      id,
      dto.status,
      dto.closeReason,
      dto.userId
    );
  }
  
}
