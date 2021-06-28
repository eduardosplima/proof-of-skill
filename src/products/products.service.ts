import { Injectable } from '@nestjs/common';

import type { Product } from './entities/product.entity';
import { DuplicatedSkuException } from './exceptions/duplicated-sku.exception';
import { SkuNotFoundException } from './exceptions/sku-not-found.exception';
import { ProductsRepository } from './repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  private save(product: Product): Product {
    /**
     * Deep copy to avoid changes in original object
     * (I did like this to simplify, since the amount of attributes is so small)
     */
    const productAux: Product = {
      sku: product.sku,
      name: product.name,
      inventory: {
        warehouses: product.inventory.warehouses,
      },
    };

    /**
     * I decided to calculate this data in persistence,
     * because this will allow to query these fields directly without aggregations in the "database".
     */
    productAux.inventory.quantity = productAux.inventory.warehouses.reduce(
      (accumulator, current) => accumulator + current.quantity,
      0,
    );
    productAux.isMarketable = productAux.inventory.quantity > 0;

    this.productsRepository.set(productAux);
    return productAux;
  }

  create(newProduct: Product): number {
    const duplicated = this.findOne(newProduct.sku);
    if (duplicated) {
      throw new DuplicatedSkuException(
        `There is already a product named [${duplicated.name}] with SKU [${duplicated.sku}]`,
      );
    }

    this.save(newProduct);
    return newProduct.sku;
  }

  findAll(): Array<Product> {
    return this.productsRepository.getAll();
  }

  findOne(sku: number): Product {
    return this.productsRepository.get(sku);
  }

  update(sku: number, updatedProduct: Product): void {
    const oldProduct = this.findOne(sku);
    if (!oldProduct) {
      throw new SkuNotFoundException(`SKU [${sku}] not found`);
    }

    if (oldProduct.sku !== updatedProduct.sku) {
      const duplicated = this.findOne(updatedProduct.sku);
      if (duplicated) {
        throw new DuplicatedSkuException(
          `There is already a product named [${duplicated.name}] with SKU [${duplicated.sku}]`,
        );
      }

      this.remove(oldProduct.sku);
    }

    this.save(updatedProduct);
  }

  remove(sku: number): void {
    const product = this.findOne(sku);
    if (!product) {
      throw new SkuNotFoundException(`SKU [${sku}] not found`);
    }

    this.productsRepository.delete(sku);
  }
}
