import { ProductTypeEnum } from '../enums/product-type.enum';

export class Product {
  sku: number;

  name: string;

  inventory: {
    quantity?: number;

    warehouses: Array<{
      locality: string;

      quantity: number;

      type: ProductTypeEnum;
    }>;
  };

  isMarketable?: boolean;
}
