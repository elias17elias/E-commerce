import * as ProductsRepository from '../repositories/products.repository.js';
import { NotFoundError,AppError } from '../utils/AppError.js';

export const getAllProducts = async (query) => {
    return await ProductsRepository.findAll(query);
};

export const getProductById = async (id) => {
    const product = await ProductsRepository.findById(id);

    if (!product) {
        throw new NotFoundError(`Product with id ${id} not found`);
    }

    return product;
};

export const createProduct = async ({ name, price, stock }) => {
    return await ProductsRepository.create({ name:name.trim(), price, stock });
}

export const updateProduct = async (id, { name, price, stock }) => {
    const updatedProduct = await ProductsRepository.update(
        id,
        { name: name.trim(), price, stock }
    );
    if (!updatedProduct) {
        throw new NotFoundError(`Product with id ${id} not found`);
    }
    return updatedProduct;
};

export const deleteProduct = async (id) => {
    const deletedProduct = await ProductsRepository.deleteById(id);
    if (!deletedProduct) {
        throw new NotFoundError(`Product with id ${id} not found`);
    }
}