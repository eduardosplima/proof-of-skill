import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { ProductTypeEnum } from '../enums/product-type.enum';

export class WarehouseInventoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  locality: string;

  @ApiProperty()
  @Min(0)
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsEnum(ProductTypeEnum)
  @IsNotEmpty()
  type: ProductTypeEnum;
}
