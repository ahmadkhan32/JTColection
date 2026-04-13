import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { OrderService } from '../services/order.service.js';

const orderService = new OrderService();

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'User not authenticated');
  }

  const order = await orderService.createOrder({
    user_id: req.user.id,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order,
  });
});

export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'User not authenticated');
  }

  const { limit = 10, offset = 0 } = req.query;
  const { orders, total } = await orderService.getOrdersByUserId(
    req.user.id,
    parseInt(limit as string),
    parseInt(offset as string)
  );

  res.json({
    success: true,
    orders,
    pagination: {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      total,
    },
  });
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10, offset = 0 } = req.query;
  const { orders, total } = await orderService.getAllOrders(
    parseInt(limit as string),
    parseInt(offset as string)
  );

  res.json({
    success: true,
    orders,
    pagination: {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      total,
    },
  });
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await orderService.getOrderById(id);

  res.json({
    success: true,
    order,
  });
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await orderService.updateOrder({
    id,
    ...req.body,
  });

  res.json({
    success: true,
    message: 'Order updated successfully',
    order,
  });
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await orderService.deleteOrder(id);

  res.json({
    success: true,
    message: 'Order deleted successfully',
  });
});

export const getOrderStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await orderService.getOrderStats();

  res.json({
    success: true,
    stats,
  });
});
