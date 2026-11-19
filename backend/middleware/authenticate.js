import { UnauthorizedError } from '../utils/AppError.js';
import { verifyToken } from '../utils/accessToken.js';
import { findById } from '../repositories/users.repository.js';
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new UnauthorizedError('No token provided');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token || authHeader.split(' ').length !== 2) {
        throw new UnauthorizedError('Invalid authorization header');
    }

    const decoded = verifyToken(token);

    const id = decoded.sub;
    const user = await findById(id);
    if (!user) {
        throw new UnauthorizedError('User no longer exists');
    }
    req.user = user;

    next();
};

export default authenticate;