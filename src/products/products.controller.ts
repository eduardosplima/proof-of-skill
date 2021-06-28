import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  ConflictException,
  NotFoundException,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HttpLogger } from '../commom/decorators/http-logger.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DuplicatedSkuException } from './exceptions/duplicated-sku.exception';
import { SkuNotFoundException } from './exceptions/sku-not-found.exception';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ description: 'Creates a new product' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product created' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Product SKU already exists',
  })
  @HttpLogger()
  @Post()
  create(@Body() createProductDto: CreateProductDto): unknown {
    let sku: number;

    try {
      sku = this.productsService.create(createProductDto);
    } catch (error) {
      if (error instanceof DuplicatedSkuException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }

    return { sku };
  }

  @ApiOperation({ description: 'Gets all products' })
  @ApiResponse({ status: HttpStatus.OK, type: [GetProductDto] })
  @Get()
  findAll(): unknown {
    return this.productsService.findAll();
  }

  @ApiOperation({ description: 'Gets a product by SKU' })
  @ApiResponse({ status: HttpStatus.OK, type: GetProductDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product SKU not found',
  })
  @Get(':sku')
  findOne(@Param('sku', ParseIntPipe) sku: number): unknown {
    const product = this.productsService.findOne(sku);
    if (product) {
      return product;
    }

    throw new NotFoundException();
  }

  @ApiOperation({ description: 'Updates a product by SKU' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product SKU not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Product SKU already exists',
  })
  @Put(':sku')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(
    @Param('sku', ParseIntPipe) sku: number,
    @Body() updateProductDto: UpdateProductDto,
  ): void {
    try {
      this.productsService.update(sku, updateProductDto);
    } catch (error) {
      if (error instanceof SkuNotFoundException) {
        throw new NotFoundException();
      }
      if (error instanceof DuplicatedSkuException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @ApiOperation({ description: 'Removes a product by SKU' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product removed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product SKU not found',
  })
  @Delete(':sku')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('sku', ParseIntPipe) sku: number): void {
    try {
      this.productsService.remove(sku);
    } catch (error) {
      if (error instanceof SkuNotFoundException) {
        throw new NotFoundException();
      }

      throw error;
    }
  }
}
