import type { Product } from '../../src/products/entities/product.entity';
import { ProductTypeEnum } from '../../src/products/enums/product-type.enum';

export const productsFixture: Array<Product> = [
  {
    sku: 1,
    name: 'Item 1',
    inventory: {
      quantity: 500,
      warehouses: [
        { locality: 'SP', quantity: 500, type: ProductTypeEnum.ECOMMERCE },
      ],
    },
    isMarketable: true,
  },
  {
    sku: 2,
    name: 'Item 2',
    inventory: {
      quantity: 200,
      warehouses: [
        { locality: 'RJ', quantity: 100, type: ProductTypeEnum.PHYSICAL_STORE },
        { locality: 'MG', quantity: 100, type: ProductTypeEnum.PHYSICAL_STORE },
      ],
    },
    isMarketable: true,
  },
];
