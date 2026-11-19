import { ForbiddenError } from '../utils/AppError.js';

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            throw new ForbiddenError(
                'You do not have permission to access this resource'
            );
        }

        next();
    };
};

export const authorizeSelfOrAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && String(req.user.id) !== req.params.id) {
        throw new ForbiddenError(
            'You do not have permission to access this resource'
        );
    }

    next();
};

export default authorize;