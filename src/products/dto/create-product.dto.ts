import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { InventoryProductDto } from './inventory-product.dto';

export class CreateProductDto {
  @ApiProperty()
  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  sku: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @ValidateNested()
  @IsObject()
  @IsNotEmpty()
  @Type(() => InventoryProductDto)
  inventory: InventoryProductDto;
}
