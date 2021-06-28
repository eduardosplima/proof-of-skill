import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { LoggerService } from '../src/core/logger/logger.service';
import type { Product } from '../src/products/entities/product.entity';
import { ProductTypeEnum } from '../src/products/enums/product-type.enum';
import { ProductsRepository } from '../src/products/repositories/products.repository';
import { productsFixture } from './fixtures/products.fixture';
import { MockLoggerService } from './mocks/logger.service';

describe('Products (e2e)', () => {
  const url = '/products';

  let app: NestFastifyApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LoggerService)
      .useValue(new MockLoggerService())
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    const repo = app.get(ProductsRepository);
    repo.clear();
    productsFixture.forEach((p) => repo.set(p));
  });

  describe('Retrieving products', () => {
    it('Retrieving all', async () => {
      return app
        .inject({
          method: 'GET',
          url,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);
          expect(result.body).toEqual(JSON.stringify(productsFixture));
        });
    });

    it('Retrieving by SKU', async () => {
      return app
        .inject({
          method: 'GET',
          url: `${url}/1`,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);
          expect(result.body).toEqual(JSON.stringify(productsFixture[0]));
        });
    });

    it('Retrieving inexistent SKU', async () => {
      return app
        .inject({
          method: 'GET',
          url: `${url}/100`,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(404);
        });
    });
  });

  describe('Creating products', () => {
    let product: Product;

    beforeEach(() => {
      product = {
        sku: 3,
        name: 'Item 3',
        inventory: {
          warehouses: [
            { locality: 'SP', quantity: 500, type: ProductTypeEnum.ECOMMERCE },
          ],
        },
      };
    });

    it('Validating SKU required', async () => {
      delete product.sku;

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating SKU format', async () => {
      // @ts-expect-error test
      product.sku = 'abc';

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating name required', async () => {
      delete product.name;

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating name format', async () => {
      // @ts-expect-error test
      product.name = 123;

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory required', async () => {
      delete product.inventory;

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory format', async () => {
      // @ts-expect-error test
      product.inventory = [];

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses required', async () => {
      delete product.inventory.warehouses;

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses format', async () => {
      // @ts-expect-error test
      product.inventory.warehouses = {};

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses elements format', async () => {
      // @ts-expect-error test
      product.inventory.warehouses.push([]);

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.locality required', async () => {
      delete product.inventory.warehouses[0].locality;

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.locality format', async () => {
      // @ts-expect-error test
      product.inventory.warehouses[0].locality = {};

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.quantity required', async () => {
      delete product.inventory.warehouses[0].quantity;

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.quantity format', async () => {
      // @ts-expect-error test
      product.inventory.warehouses[0].quantity = {};

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.type required', async () => {
      delete product.inventory.warehouses[0].type;

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.type format', async () => {
      // @ts-expect-error test
      product.inventory.warehouses[0].type = {};

      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Creating product', async () => {
      return app
        .inject({
          method: 'POST',
          url,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(201);
          expect(result.body).toEqual(JSON.stringify({ sku: product.sku }));
        });
    });

    it('Duplicating product', async () => {
      return app
        .inject({
          method: 'POST',
          url,
          payload: productsFixture[0],
        })
        .then((result) => {
          expect(result.statusCode).toEqual(409);
        });
    });
  });

  describe('Updating products', () => {
    let product: Product;

    beforeEach(() => {
      product = {
        sku: 1,
        name: 'Item 1 v2',
        inventory: {
          warehouses: [
            { locality: 'SP', quantity: 1000, type: ProductTypeEnum.ECOMMERCE },
          ],
        },
      };
    });

    it('Validating SKU required', async () => {
      delete product.sku;

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating SKU format', async () => {
      // @ts-expect-error test
      product.sku = 'abc';

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating name required', async () => {
      delete product.name;

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating name format', async () => {
      // @ts-expect-error test
      product.name = 123;

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory required', async () => {
      delete product.inventory;

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory format', async () => {
      // @ts-expect-error test
      product.inventory = [];

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses required', async () => {
      delete product.inventory.warehouses;

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses format', async () => {
      // @ts-expect-error test
      product.inventory.warehouses = {};

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses elements format', async () => {
      // @ts-expect-error test
      product.inventory.warehouses.push([]);

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.locality required', async () => {
      delete product.inventory.warehouses[0].locality;

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.locality format', async () => {
      // @ts-expect-error test
      product.inventory.warehouses[0].locality = {};

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.quantity required', async () => {
      delete product.inventory.warehouses[0].quantity;

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.quantity format', async () => {
      // @ts-expect-error test
      product.inventory.warehouses[0].quantity = {};

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.type required', async () => {
      delete product.inventory.warehouses[0].type;

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Validating inventory.warehouses.type format', async () => {
      // @ts-expect-error test
      product.inventory.warehouses[0].type = {};

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('Updating product', async () => {
      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(204);
        });
    });

    it('Updating product with changing SKU', async () => {
      product.sku = 5;

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(204);
        });
    });

    it('Updating product, changing to an existent SKU', async () => {
      product.sku = 2;

      return app
        .inject({
          method: 'PUT',
          url: `${url}/1`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(409);
        });
    });

    it('Removing inexistent SKU', async () => {
      return app
        .inject({
          method: 'PUT',
          url: `${url}/100`,
          payload: product,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(404);
        });
    });
  });

  describe('Deleting products', () => {
    it('Deleting by SKU', async () => {
      return app
        .inject({
          method: 'DELETE',
          url: `${url}/1`,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(204);
        });
    });

    it('Deleting inexistent SKU', async () => {
      return app
        .inject({
          method: 'DELETE',
          url: `${url}/100`,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(404);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
