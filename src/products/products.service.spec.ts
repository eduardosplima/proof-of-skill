import { Test, TestingModule } from '@nestjs/testing';

import type { Product } from './entities/product.entity';
import { ProductTypeEnum } from './enums/product-type.enum';
import { DuplicatedSkuException } from './exceptions/duplicated-sku.exception';
import { SkuNotFoundException } from './exceptions/sku-not-found.exception';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';

class MockProductsRepository {
  delete = jest.fn();

  get = jest.fn();

  getAll = jest.fn();

  set = jest.fn();
}

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: ProductsRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsRepository, ProductsService],
    })
      .overrideProvider(ProductsRepository)
      .useValue(new MockProductsRepository())
      .compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('success, isMarketable = true', () => {
      service.create({
        sku: 1,
        name: 'product',
        inventory: {
          warehouses: [
            {
              locality: 'a',
              quantity: 5,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
            {
              locality: 'b',
              quantity: 10,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
          ],
        },
      });
      expect(repository.set).toBeCalledWith({
        sku: 1,
        name: 'product',
        inventory: {
          quantity: 15,
          warehouses: [
            {
              locality: 'a',
              quantity: 5,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
            {
              locality: 'b',
              quantity: 10,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
          ],
        },
        isMarketable: true,
      });
    });

    it('success, isMarketable = false', () => {
      service.create({
        sku: 1,
        name: 'product',
        inventory: {
          warehouses: [
            {
              locality: 'a',
              quantity: 0,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
          ],
        },
      });
      expect(repository.set).toBeCalledWith({
        sku: 1,
        name: 'product',
        inventory: {
          quantity: 0,
          warehouses: [
            {
              locality: 'a',
              quantity: 0,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
          ],
        },
        isMarketable: false,
      });
    });

    it('duplicated', () => {
      const mock = jest
        .spyOn(repository, 'get')
        .mockImplementation(() => ({} as Product));

      expect(() => {
        service.create({
          sku: 1,
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
      }).toThrow(DuplicatedSkuException);

      mock.mockRestore();
    });
  });

  describe('findAll', () => {
    it('success', () => {
      service.findAll();
      expect(repository.getAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('success', () => {
      service.findOne(1);
      expect(repository.get).toBeCalledWith(1);
    });
  });

  describe('update', () => {
    const SKU_1 = 1;
    const SKU_2 = 2;

    let spied: jest.SpyInstance;

    beforeAll(() => {
      spied = jest.spyOn(repository, 'get').mockImplementation((sku) => {
        if (sku === SKU_1) return { sku: SKU_1 } as Product;
        if (sku === SKU_2) return { sku: SKU_2 } as Product;
        return null;
      });
    });

    it('success, isMarketable = true', () => {
      service.update(SKU_1, {
        sku: SKU_1,
        name: 'product',
        inventory: {
          warehouses: [
            {
              locality: 'a',
              quantity: 5,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
            {
              locality: 'b',
              quantity: 10,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
          ],
        },
      });
      expect(repository.set).toBeCalledWith({
        sku: SKU_1,
        name: 'product',
        inventory: {
          quantity: 15,
          warehouses: [
            {
              locality: 'a',
              quantity: 5,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
            {
              locality: 'b',
              quantity: 10,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
          ],
        },
        isMarketable: true,
      });
    });

    it('success, isMarketable = false', () => {
      service.update(SKU_1, {
        sku: SKU_1,
        name: 'product',
        inventory: {
          warehouses: [
            {
              locality: 'a',
              quantity: 0,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
          ],
        },
      });
      expect(repository.set).toBeCalledWith({
        sku: SKU_1,
        name: 'product',
        inventory: {
          quantity: 0,
          warehouses: [
            {
              locality: 'a',
              quantity: 0,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
          ],
        },
        isMarketable: false,
      });
    });

    it('success, changing SKU', () => {
      service.update(SKU_1, {
        sku: 3,
        name: 'product',
        inventory: {
          warehouses: [
            {
              locality: 'a',
              quantity: 0,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
          ],
        },
      });
      expect(repository.delete).toBeCalledWith(SKU_1);
      expect(repository.set).toBeCalledWith({
        sku: 3,
        name: 'product',
        inventory: {
          quantity: 0,
          warehouses: [
            {
              locality: 'a',
              quantity: 0,
              type: ProductTypeEnum.PHYSICAL_STORE,
            },
          ],
        },
        isMarketable: false,
      });
    });

    it('duplicated', () => {
      expect(() => {
        service.update(SKU_1, {
          sku: SKU_2,
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
      }).toThrow(DuplicatedSkuException);
    });

    it('not found', () => {
      expect(() => {
        service.update(3, {
          sku: SKU_1,
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
      }).toThrow(SkuNotFoundException);
    });

    afterAll(() => {
      spied.mockRestore();
    });
  });

  describe('remove', () => {
    const SKU = 1;

    let spied: jest.SpyInstance;

    beforeAll(() => {
      spied = jest.spyOn(repository, 'get').mockImplementation((sku) => {
        if (sku === SKU) return { sku: SKU } as Product;
        return null;
      });
    });

    it('success', () => {
      service.remove(SKU);
      expect(repository.delete).toBeCalledWith(SKU);
    });

    it('not found', () => {
      expect(() => {
        service.remove(3);
      }).toThrow(SkuNotFoundException);
    });

    afterAll(() => {
      spied.mockRestore();
    });
  });
});
