import * as usersService from '../services/users.service.js';
import { AppError } from '../utils/AppError.js';
import { assertAllowedProperties } from '../middleware/validate.js';
export const getUsers = async (req, res, next) => {

    const users = await usersService.getAllUsers();
    res.status(200).json(users);

};

export const getUserById = async (req, res, next) => {
    const { id } = req.params;

    const user = await usersService.getUserById(id);
    res.status(200).json(user);

};

export const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    await usersService.deleteUser(id);
    res.status(204).send();

};

export const updateUserName = async (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new AppError('Request body must be a JSON object', 400);
    }
    assertAllowedProperties(req.body, ['name']);
    const { id } = req.params;
    const { name } = req.body;
    if (typeof name !== 'string' || name.trim() === '' || name.trim().length > 100) {
        throw new AppError('Name must be a non-empty string of at most 100 characters', 400);
    }

    const updatedUser = await usersService.updateUserName(id, name.trim());
    res.status(200).json(updatedUser);

};

export const increaseUserBalance = async (req, res, next) => {
    const { id } = req.params;
    const { amount } = req.body;
    const updatedUser = await usersService.increaseUserBalance(id, amount);
    res.status(200).json(updatedUser);
};

