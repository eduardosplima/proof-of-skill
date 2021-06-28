import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { WarehouseInventoryDto } from './warehouse-inventory.dto';

export class InventoryProductDto {
  @ApiProperty({ type: [WarehouseInventoryDto] })
  @ValidateNested({ each: true })
  @IsObject({ each: true })
  @IsArray()
  @IsNotEmpty()
  @Type(() => WarehouseInventoryDto)
  warehouses: Array<WarehouseInventoryDto>;
}
