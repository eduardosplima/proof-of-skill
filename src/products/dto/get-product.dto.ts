import { ApiProperty, getSchemaPath, OmitType } from '@nestjs/swagger';

import { CreateProductDto } from './create-product.dto';
import { InventoryProductDto } from './inventory-product.dto';

export class GetProductDto extends OmitType(CreateProductDto, [
  'inventory',
] as const) {
  @ApiProperty({
    allOf: [
      {
        type: 'object',
        properties: {
          quantity: {
            type: 'number',
          },
        },
      },
      { $ref: getSchemaPath(InventoryProductDto) },
    ],
  })
  inventory: unknown;

  @ApiProperty()
  isMarketable: boolean;
}
