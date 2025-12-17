import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './evaluation.dto';
import { UpdateEvaluationStatusDto } from './evaluation.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Evaluations')
@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new evaluation request' })
  @ApiBody({ type: CreateEvaluationDto })
  create(@Body() dto: CreateEvaluationDto) {
    return this.evaluationService.create(dto);
  }

  @Get('pawnshop/:id')
  @ApiOperation({ summary: 'Get all evaluation requests by pawnshop ID' })
  @ApiParam({ name: 'id', description: 'Pawnshop ID' })
  getByPawnshop(@Param('id') pawnshopId: string) {
    return this.evaluationService.getByPawnshop(pawnshopId);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get evaluation requests sent by user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  getByUser(@Param('id') userId: string) {
    return this.evaluationService.getByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evaluation by ID' })
  @ApiParam({ name: 'id', description: 'Evaluation ID' })

  getById(@Param('id') id: string) {
    return this.evaluationService.getById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update evaluation status' })
  @ApiParam({ name: 'id', description: 'Evaluation ID' })
  @ApiBody({ type: UpdateEvaluationStatusDto })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateEvaluationStatusDto) {
    return this.evaluationService.updateStatus(id, dto);
  }
}