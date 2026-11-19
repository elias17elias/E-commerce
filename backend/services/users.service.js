import { ConflictError, NotFoundError } from '../utils/AppError.js';
import * as usersRepository from '../repositories/users.repository.js';

export const getAllUsers = async () => {
    return await usersRepository.findAll();
};

export const getUserById = async (id) => {
    const user = await usersRepository.findById(id);
    if (!user) {
        throw new NotFoundError(`User with id ${id} not found`);
    }
    return user;
};

export const deleteUser = async (id) => {
    const deletedUser = await usersRepository.deleteById(id);
    if (!deletedUser) {
        throw new NotFoundError(`User with id ${id} not found`);
    }
};

export const updateUserName = async (id, name) => {
    const updatedUser = await usersRepository.updateUserNameById(id, name);
    if (!updatedUser) {
        throw new NotFoundError(`User with id ${id} not found`);
    }
    return updatedUser;
};

export const increaseUserBalance = async (id, amount) => {
    const updatedUser = await usersRepository.increaseBalanceById(id, amount);
    if (updatedUser) {
        return updatedUser;
    }

    const user = await usersRepository.findById(id);
    if (!user) {
        throw new NotFoundError(`User with id ${id} not found`);
    }
    throw new ConflictError('Balance exceeds the maximum allowed value');
};