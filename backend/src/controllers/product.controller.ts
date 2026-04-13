import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { ProductService } from '../services/product.service.js';

const productService = new ProductService();

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product,
  });
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category_id, limit = 10, offset = 0 } = req.query;
  const { products, total } = await productService.getProducts({
    category_id: category_id as string,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  });

  res.json({
    success: true,
    products,
    pagination: {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      total,
    },
  });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);

  res.json({
    success: true,
    product,
  });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await productService.updateProduct({
    id,
    ...req.body,
  });

  res.json({
    success: true,
    message: 'Product updated successfully',
    product,
  });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await productService.deleteProduct(id);

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await productService.getCategories();

  res.json({
    success: true,
    categories,
  });
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await productService.getCategoryById(id);

  res.json({
    success: true,
    category,
  });
});
