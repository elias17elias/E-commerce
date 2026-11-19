import env from './config/env.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import usersRouter from './routes/users.route.js';
import ordersRouter from './routes/orders.route.js';
import productsRouter from './routes/products.route.js';
import errorHandler from './middleware/errorHandler.js';
import authRouter from './routes/auth.route.js';
const app = express();
const PORT = env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);
app.use('/products', productsRouter);
app.use('/auth', authRouter);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
