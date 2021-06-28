import { Injectable } from '@nestjs/common';

import type { Product } from '../entities/product.entity';

@Injectable()
export class ProductsRepository {
  private readonly products: Map<number, Product>;

  constructor() {
    this.products = new Map();
  }

  clear(): void {
    this.products.clear();
  }

  delete(sku: number): void {
    this.products.delete(sku);
  }

  get(sku: number): Product {
    return this.products.get(sku);
  }

  getAll(): Array<Product> {
    return Array.from(this.products.values());
  }

  set(product: Product): void {
    this.products.set(product.sku, product);
  }
}
