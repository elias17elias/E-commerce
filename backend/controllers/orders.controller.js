import * as ordersService from '../services/orders.service.js';
import { AppError } from '../utils/AppError.js';
import { assertAllowedProperties } from '../middleware/validate.js';
export const getAllOrders = async (req, res, next) => {

    const orders = await ordersService.getAllOrders(req.listQuery);
    res.status(200).json(orders);

};

export const getOrderById = async (req, res, next) => {
    const { id } = req.params;

    const order = await ordersService.getOrderById(id, req.user);
    res.status(200).json(order);

};

export const createOrder = async (req, res, next) => {
    const { data } = req.body;

    const order = await ordersService.createOrder({ userId: req.user.id, data });
    res.status(201).json(order);

};

export const updateOrderStatus = async (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new AppError('Request body must be a JSON object', 400);
    }
    assertAllowedProperties(req.body, ['status']);
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await ordersService.updateOrderStatus(id, status);
    res.status(200).json(updatedOrder);

};

export const deleteOrder = async (req, res, next) => {
    const { id } = req.params;

    await ordersService.deleteOrder(id);
    res.status(204).send();
};
