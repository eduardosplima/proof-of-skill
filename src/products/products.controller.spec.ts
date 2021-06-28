import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { HttpLoggerInterceptor } from '../commom/interceptors/http-logger.interceptor';
import type { Product } from './entities/product.entity';
import { ProductTypeEnum } from './enums/product-type.enum';
import { DuplicatedSkuException } from './exceptions/duplicated-sku.exception';
import { SkuNotFoundException } from './exceptions/sku-not-found.exception';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';

describe('ProductsController', () => {
  const OK_SKU = 1;
  const DUPLICATED_SKU = 2;
  const NOT_FOUND_SKU = 3;

  let controller: ProductsController;
  let service: ProductsService;
  let spied: jest.SpyInstance;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsRepository, ProductsService],
    })
      .overrideFilter(HttpLoggerInterceptor)
      .useValue({})
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  beforeEach(() => {
    if (spied) spied.mockClear();
  });

  describe('create', () => {
    beforeAll(() => {
      spied = jest.spyOn(service, 'create').mockImplementation((p) => {
        if (p.sku === OK_SKU) return p.sku;
        if (p.sku === DUPLICATED_SKU) throw new DuplicatedSkuException('');
        return null;
      });
    });

    it('success', () => {
      const result = controller.create({
        sku: OK_SKU,
        name: 'product',
        inventory: {
          warehouses: [
            {
              locality: 'xx',
              quantity: 5,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
          ],
        },
      });
      expect(result).toEqual({ sku: OK_SKU });
    });

    it('duplicated', () => {
      expect(() => {
        controller.create({
          sku: DUPLICATED_SKU,
          name: 'product',
          inventory: {
            warehouses: [
              {
                locality: 'xx',
                quantity: 5,
                type: ProductTypeEnum.PHYSICAL_STORE,
              },
            ],
          },
        });
      }).toThrow(ConflictException);
    });

    afterAll(() => {
      spied.mockRestore();
    });
  });

  describe('findAll', () => {
    beforeAll(() => {
      spied = jest.spyOn(service, 'findAll').mockImplementation(() => []);
    });

    it('success', () => {
      controller.findAll();
      expect(spied).toHaveBeenCalled();
    });

    afterAll(() => {
      spied.mockRestore();
    });
  });

  describe('findOne', () => {
    const product: Product = {
      sku: OK_SKU,
      name: 'xxx',
      inventory: {
        quantity: 0,
        warehouses: [],
      },
      isMarketable: false,
    };

    beforeAll(() => {
      spied = jest.spyOn(service, 'findOne').mockImplementation((sku) => {
        if (sku === OK_SKU) return product;
        return null;
      });
    });

    it('success', () => {
      const result = controller.findOne(OK_SKU);
      expect(result).toEqual(product);
    });

    it('not found', () => {
      expect(() => {
        controller.findOne(NOT_FOUND_SKU);
      }).toThrow(NotFoundException);
    });

    afterAll(() => {
      spied.mockRestore();
    });
  });

  describe('update', () => {
    const product: Product = {
      sku: OK_SKU,
      name: 'xxx',
      inventory: {
        warehouses: [],
      },
    };

    beforeAll(() => {
      spied = jest.spyOn(service, 'update').mockImplementation((sku) => {
        if (sku === DUPLICATED_SKU) throw new DuplicatedSkuException('');
        if (sku === NOT_FOUND_SKU) throw new NotFoundException('');
      });
    });

    it('success', () => {
      controller.update(OK_SKU, product);
      expect(spied).toBeCalledWith(OK_SKU, product);
    });

    it('duplicated', () => {
      expect(() => {
        controller.update(DUPLICATED_SKU, product);
      }).toThrow(ConflictException);
    });

    it('not found', () => {
      expect(() => {
        controller.update(NOT_FOUND_SKU, product);
      }).toThrow(NotFoundException);
    });

    afterAll(() => {
      spied.mockRestore();
    });
  });

  describe('remove', () => {
    beforeAll(() => {
      spied = jest.spyOn(service, 'remove').mockImplementation((sku) => {
        if (sku === NOT_FOUND_SKU) throw new SkuNotFoundException('');
      });
    });

    it('success', () => {
      controller.remove(OK_SKU);
      expect(spied).toBeCalledWith(OK_SKU);
    });

    it('not found', () => {
      expect(() => {
        controller.remove(NOT_FOUND_SKU);
      }).toThrow(NotFoundException);
    });

    afterAll(() => {
      spied.mockRestore();
    });
  });
});
