import * as productsService from '../services/products.service.js';

export const getAllProducts = async (req, res, next) => {

    const products = await productsService.getAllProducts(req.listQuery);
    res.status(200).json(products);

};

export const getProductById = async (req, res, next) => {
    const { id } = req.params;

    const product = await productsService.getProductById(id);
    res.status(200).json(product);

};

export const createProduct = async (req, res, next) => {
    const { name, price, stock } = req.body;

    const newProduct = await productsService.createProduct({ name, price, stock });
    res.status(201).json(newProduct);

};
export const updateProduct = async (req, res, next) => {
    const { id } = req.params;
    const { name, price, stock } = req.body;

    const updatedProduct = await productsService.updateProduct(id, { name, price, stock });
    res.status(200).json(updatedProduct);

};

export const deleteProduct = async (req, res, next) => {
    const { id } = req.params;

    await productsService.deleteProduct(id);
    res.status(204).send();

};