import * as ordersRepository from '../repositories/orders.repository.js';
import { AppError, ForbiddenError, NotFoundError } from '../utils/AppError.js';


export const getAllOrders = async (query) => {
    return await ordersRepository.findAll(query);
};

export const getOrdersByUserId = async (userId, requestingUser, query) => {
    if (
        requestingUser.role !== 'admin' &&
        String(requestingUser.id) !== String(userId)
    ) {
        throw new ForbiddenError('You do not have permission to access this resource');
    }

    return await ordersRepository.findAll({
        ...query,
        filters: {
            ...query.filters,
            userId: Number(userId),
        },
    });
};

export const getOrderById = async (id, requestingUser) => {
    const order = await ordersRepository.findById(id);
    if (!order) {
        throw new NotFoundError(`Order with id ${id} not found`);
    }
    if (
        requestingUser.role !== 'admin' &&
        String(order.user_id) !== String(requestingUser.id)
    ) {
        throw new ForbiddenError('You do not have permission to access this resource');
    }
    return order;
};

export const createOrder = async ({ userId, data }) => {
    
    const quantities = new Map();
    for (const item of data) {
        const quantity = (quantities.get(item.product_id) ?? 0) + item.quantity;
        if (!Number.isSafeInteger(quantity) || quantity > 2147483647) {
            throw new AppError('Combined quantity exceeds the maximum allowed value', 400);
        }
        quantities.set(item.product_id, quantity);
    }
    data = Array.from(quantities.entries()).map(
        ([product_id, quantity]) => ({ product_id, quantity })
    );
    const order = await ordersRepository.create({ userId, data });
    return order;
};

export const updateOrderStatus = async (id, status) => {
    
    if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
        throw new AppError('Valid status is required', 400);
    }
    const updatedOrder = await ordersRepository.updateStatus(id, status);
    if (!updatedOrder) {
        throw new NotFoundError(`Order with id ${id} not found`);
    }
    return updatedOrder;
};

export const deleteOrder = async (id) => {
    const order = await ordersRepository.deleteById(id);
    if (!order) {
        throw new NotFoundError(`Order with id ${id} not found`);
    }
};